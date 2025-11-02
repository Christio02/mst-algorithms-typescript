import type { PrimQueueItem } from "../interface.js";

export class PriorityQueue<T extends PrimQueueItem> {
    private heap_array: T[];

    constructor() {
        this.heap_array = [];
    }

    /**
     * Adds an element to the queue and re-balances the heap by calling bubbleUp.
     */
    enqueue(element: T): void {
        // add element to end of heap array
        this.heap_array.push(element);

        // call buble up
        this.bubbleUp(this.size() - 1);
    }

    dequeue(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }

        // store highest priority element (root)
        const minElement = this.heap_array[0];

        // move last element to root position
        const lastElement = this.heap_array.pop();

        // if the heap is not empty, restore the heap property by moving the root down.

        // place the last element at the root and then fix the heap
        if (!this.isEmpty() && lastElement != undefined) {
            this.heap_array[0] = lastElement;

            // call bubbledown
            this.bubbleDown(0);
        }
        // if the heap only had one element, it was removed by pop()
        if (this.isEmpty() && lastElement !== undefined) {
            return lastElement;
        }

        return minElement;
    }

    peek(): T | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.heap_array[0]; // root element
    }

    isEmpty(): boolean {
        return this.heap_array.length === 0;
    }

    size(): number {
        return this.heap_array.length;
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;

        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);

            if (
                this.heap_array[currentIndex].priority <
                this.heap_array[parentIndex].priority
            ) {
                [this.heap_array[currentIndex], this.heap_array[parentIndex]] =
                    [
                        this.heap_array[parentIndex],
                        this.heap_array[currentIndex],
                    ];
                currentIndex = parentIndex;
            } else {
                break; // heap property satisfied
            }
        }
    }

    private bubbleDown(index: number): void {
        let currentIndex = index;

        const n = this.size();

        while (currentIndex < n) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;

            let smallestIndex = currentIndex;

            // find the index of the element with the smallest priority among parent and children

            // check left child
            if (
                leftChildIndex < n &&
                this.heap_array[leftChildIndex].priority <
                    this.heap_array[smallestIndex].priority
            ) {
                smallestIndex = leftChildIndex;
            }

            // check right child
            if (
                rightChildIndex < n &&
                this.heap_array[rightChildIndex].priority <
                    this.heap_array[smallestIndex].priority
            ) {
                smallestIndex = rightChildIndex;
            }

            // if current element is not smallest index, swap
            if (smallestIndex != currentIndex) {
                [
                    this.heap_array[currentIndex],
                    this.heap_array[smallestIndex],
                ] = [
                    this.heap_array[smallestIndex],
                    this.heap_array[currentIndex],
                ];
                currentIndex = smallestIndex; // continue checking from the new position
            } else {
                break;
            }
        }
    }
}
