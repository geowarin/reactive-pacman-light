package org.coinen.reactive.pacman.repository.support;

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

import org.coinen.reactive.pacman.repository.ExtrasRepository;
import org.jctools.maps.NonBlockingSetInt;
import org.roaringbitmap.RoaringBitmap;

import static org.coinen.reactive.pacman.repository.ExtrasRepository.randomPosition;

public class InMemoryExtrasRepository implements ExtrasRepository {

    final int tileSize = 100;
    final int mapWidth = 60;
    final int mapHeight = 60;
    final int offset = 11;
    final int totalSpace = (mapWidth - 2 * offset + 1) * (mapHeight - 2 * offset + 1);
    final int boundaryHalf = (int) Math.ceil(totalSpace / 360d);
    final int boundaryQuarter =  (int) Math.ceil(totalSpace / 900d);

    final NonBlockingSetInt controlMap = new NonBlockingSetInt();
    final RoaringBitmap bitmap = new RoaringBitmap();

    volatile int powerUpExtrasCount = 0;
    static final AtomicIntegerFieldUpdater<InMemoryExtrasRepository> POWER_UP_EXTRAS_COUNT =
        AtomicIntegerFieldUpdater.newUpdater(InMemoryExtrasRepository.class, "powerUpExtrasCount");

    public InMemoryExtrasRepository() {
        int[] generate = generate(mapWidth, mapHeight, offset);

        for (int extra : generate) {
            controlMap.add(extra);
        }

        bitmap.add(generate);
    }

    @Override
    public int collideExtra(float x, float y) {
        var i = Math.round(x / tileSize);
        var j = Math.round(y / tileSize);

        var flattenPosition = i + j * mapWidth;

        if (controlMap.remove(flattenPosition)) {
            if (bitmap.checkedRemove(flattenPosition)) {
                return flattenPosition;
            }
            else if (bitmap.checkedRemove(-flattenPosition)) {
                return -flattenPosition;
            }
        }

        return 0;
    }

    @Override
    public int createExtra(int size) {
        var powerUpAllowed = false;

        while (true) {
            var initialCnt = powerUpExtrasCount;
            int nextCnt = initialCnt;

            if (size <= 2) {
                powerUpAllowed = initialCnt < boundaryHalf;
            }
            else if (size <= 4) {
                powerUpAllowed = initialCnt < boundaryQuarter;
            }
            else {
                powerUpAllowed = initialCnt == 0 && Math.random() < 0.02;
            }

            if (powerUpAllowed) {
                nextCnt++;
            }

            if (POWER_UP_EXTRAS_COUNT.compareAndSet(this, initialCnt, nextCnt)) {
                break;
            }
        }

        if (powerUpAllowed) {
            var nextPosition = 0;
            do {
                nextPosition = randomPosition(mapWidth, mapHeight, offset);

            } while (!controlMap.add(nextPosition));
            bitmap.add(-nextPosition);
            return -nextPosition;
        }
        else {
            var nextPosition = 0;
            do {
                nextPosition = randomPosition(mapWidth, mapHeight, offset);

            } while (!controlMap.add(nextPosition));
            bitmap.add(nextPosition);
            return nextPosition;
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Iterable<Integer> finaAll() {
        return bitmap;
    }
}
