import { GraphDimensions } from '../interfaces/dimensions';

export class CanvasDimensions {
    constructor(canvas: HTMLCanvasElement, horizontalMargin: number, verticalMargin: number) {
        this.canvas = canvas;
        this.horizontalMargin = horizontalMargin;
        this.verticalMargin = verticalMargin;
        this.setDimensions();
    }

    private canvas: HTMLCanvasElement;
    private dimensions: GraphDimensions = {};
    private horizontalMargin: number;
    private verticalMargin: number;

    public getWidth(): number {
        return this.dimensions.width;
    }

    public getHeight(): number {
        return this.dimensions.height;
    }

    public getDimensions(): GraphDimensions {
        return this.dimensions;
    }

    public getVerticalMargin(): number {
        return this.verticalMargin;
    }

    public getHorizontalMargin(): number {
        return this.horizontalMargin;
    }

    private setDimensions(): void {
        this.setCanvasStyleWidthAndHeight();
        this.setCanvasWidthAndHeight();
        this.dimensions.height = this.canvas.offsetHeight;
        this.dimensions.width = this.canvas.offsetWidth;
    }

    private setCanvasStyleWidthAndHeight(width: number = 1080, height: number = 300): void {
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    private setCanvasWidthAndHeight(): void {
        this.canvas.height = this.canvas.offsetHeight;
        this.canvas.width = this.canvas.offsetWidth;
    }
}