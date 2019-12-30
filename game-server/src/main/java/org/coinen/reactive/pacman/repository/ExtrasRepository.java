package org.coinen.reactive.pacman.repository;

public interface ExtrasRepository {

    int collideExtra(float x, float y);

    int createExtra(int size);

    Iterable<Integer> finaAll();

    default int[] generate(int width, int height, int offset) {
        var iterations =
            (int) ((width - 2 * offset) * (height - 2 * offset) * (0.3 + Math.random() * 0.3));
        var extras = new int[iterations];

        for (var i = 0; i < iterations; i++) {
            extras[i] = randomPosition(width, height, offset);
        }

        return extras;
    }

    static int randomPosition(int width, int height, int offset) {
        return (int) (Math.floor(Math.random() * (width - 2 * offset + 1) + offset) +  Math.floor(Math.random() * (height - 2 * offset + 1) + offset) * height);
    }
}
