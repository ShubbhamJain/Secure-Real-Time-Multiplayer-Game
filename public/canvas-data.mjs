const canvasWidth = 640;
const canvasHeight = 480;
const playerWidth = 30;
const playerHeight = 30;
const border = 5;
const infoBar = 45;

export const canvasCals = {
    canvasWidth,
    canvasHeight,
    playFieldWidth: canvasWidth - (border * 2),
    playFieldHeight: canvasHeight - infoBar - (border * 2),
    playFieldMinX: (canvasWidth / 2) - (canvasWidth - 10) / 2,
    playFieldMinY: (canvasHeight / 2) - (canvasHeight - 100) / 2,
    playFieldMaxX: (canvasWidth - playerWidth) - border,
    playFieldMaxY: (canvasHeight - playerHeight) - border
};

export const generateStartPos = (min, max) => {
    return Math.floor((Math.floor(Math.random() * (max - min + 1)) + min) / border) * border;
};