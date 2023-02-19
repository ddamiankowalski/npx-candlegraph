import { ElementCollector } from './elements/element-collector';
import { CanvasDimensions } from './canvas-dimensions';
import { ChartPosition } from './chart-position';
import { Candle } from './elements/candle'; 
import { ChartTime } from './chart-time';
import { Candlestick } from '../interfaces/candlestick';
import { Renderer } from './renderer/renderer';

export class CanvasManager {
    constructor(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        this.initializeCanvasAndContext(context, canvas);
        this.scrollSpeed = 10;

        this.canvas.style.backgroundColor = "#252525";
        this.addCanvasListeners();
    }

    private dimensions: CanvasDimensions;
    private position: ChartPosition;
    private time: ChartTime;
    private renderer: Renderer;

    private candleData: Candlestick[];

    private initializeCanvasAndContext(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        this.context = context;
        this.canvas = canvas;
        this.dimensions = new CanvasDimensions(this.canvas, 70, 40);
        this.position = new ChartPosition(350, 300, 1);
        this.time = new ChartTime();
        this.renderer = new Renderer(this.context, this.dimensions);
    }


    private context: CanvasRenderingContext2D | undefined;
    private canvas: HTMLCanvasElement | undefined;
    
    private mouseDown: boolean;

    private scrollSpeed: number;

    public draw(candlesData: Candlestick[]): void {
        this.clearView();
        this.candleData = candlesData;
        this.getRenderingElements();
        window.requestAnimationFrame(this.draw.bind(this, candlesData));
    }

    private clearView(): void {
        Candle.resetHighLow();
        this.context.clearRect(0, 0, this.dimensions.getWidth(), this.dimensions.getHeight());
    }

    getRenderingElements(): void {
        const elementsCollection = new ElementCollector(this.time, this.dimensions, this.position, this.candleData, this.context);
        this.drawValueLines();
        this.renderer.draw(elementsCollection.getElements());
    }

    private drawValueLines(): void {
        const { width, height } = this.dimensions.getDimensions();
        const [ maxHighCandle, maxLowCandle ] = Candle.getHighLow(); 

        const yMax = 10;
        const yLow = height - this.dimensions.getVerticalMargin();
        const columnNumbers = 10;
        const colDistance = (yLow - yMax) / columnNumbers;
        const valDiff = (maxHighCandle - maxLowCandle) / columnNumbers;

        for(let valueColumns = 0; valueColumns <= columnNumbers; valueColumns++) {
            this.context.beginPath();
            this.context.moveTo(0, yMax + colDistance * valueColumns);
            this.context.lineTo(width - 55, yMax + colDistance * valueColumns);
            this.context.strokeStyle = '#A9A9A9';
            this.context.lineWidth = .1;
            this.context.stroke();

            this.context.font = "9px sans-serif";
            this.context.fillStyle = '#A9A9A9';
            this.context.fillText(`${(maxHighCandle + valDiff * valueColumns).toFixed(2)}`, width - 45, yMax + colDistance * valueColumns + 4);
        }
    }

    drawLine(xStart: number, yStart: number, xEnd: number, yEnd: number, lineWidth: number = 1): void {
        if(xStart <= this.dimensions.getWidth() - this.dimensions.getHorizontalMargin() + 10) {
            this.context.beginPath();
            this.context.moveTo(xStart, yStart);
            this.context.lineTo(xEnd, yEnd);
            this.context.strokeStyle = '#A9A9A9';
            this.context.lineWidth = lineWidth;
            this.context.stroke();
        }
    }





















    private addCanvasListeners(): void {
        const graphWidth = this.dimensions.getWidth();
        // wheel event
        this.canvas.addEventListener('wheel', (event: WheelEvent) => {
            const zoomOffsetSyncValue = (graphWidth + this.position.viewOffset - this.dimensions.getHorizontalMargin() - event.offsetX) / this.position.colsDistance * this.scrollSpeed;

            if(event.deltaY > 0 && (this.position.colsDistance - this.scrollSpeed > this.position.maxColsDistance || !this.time.checkIfMaxTimeSpan())) {
                this.position.colsDistance = this.position.colsDistance - this.scrollSpeed;
                this.position.viewOffset = this.position.viewOffset - zoomOffsetSyncValue;

                this.position.zoom = this.position.zoom - .15;
            } else if(event.deltaY < 0 && (!this.time.checkIfMinTimeSpan() || this.position.colsDistance + this.scrollSpeed !== this.position.maxColsDistance * 2)) {
                this.position.colsDistance = this.position.colsDistance + this.scrollSpeed;
                this.position.viewOffset = this.position.viewOffset + zoomOffsetSyncValue;

                this.position.zoom = this.position.zoom + .15;
            }

            if(this.position.colsDistance <= this.position.maxColsDistance) {
                if(this.time.checkIfMaxTimeSpan()) {
                    return;
                }
                this.position.colsDistance = this.position.maxColsDistance * this.time.getPrevMaxDistanceRatio() - this.scrollSpeed;
                this.position.viewOffset = this.position.viewOffset - zoomOffsetSyncValue / this.time.getPrevMaxDistanceRatio();

                this.time.enlargeTimeSpan();

            } else if(this.position.colsDistance >= this.position.maxColsDistance * this.time.getCurrentMaxDistanceRatio()) {
                this.position.colsDistance = this.position.maxColsDistance + this.scrollSpeed;
                this.position.viewOffset = this.position.viewOffset + zoomOffsetSyncValue * this.time.getCurrentMaxDistanceRatio();

                this.time.reduceTimeSpan();

            }

            this.blockViewOffset();
        })

        this.canvas.addEventListener('mouseout', (event: MouseEvent) => {
            this.mouseDown = false;
        });

        this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
            this.mouseDown = true;
        })

        this.canvas.addEventListener('mouseup', (event: MouseEvent) => {
            this.mouseDown = false;
        })

        this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
            if(this.position.viewOffset + event.movementX > 0 && this.mouseDown) {
                this.position.viewOffset = this.position.viewOffset + event.movementX;
            }
        })
    }

    private blockViewOffset(): void {
        if(this.position.viewOffset <= 0) {
            this.position.viewOffset = 0;
        }
    }
}