/**
 * MODIFIED VERSION OF THE <GridBackground> COMPONENT FROM React-Grid-Layout/Extras
 * 
 * Original version returns shaded-in cells that represent the actual grid slots.
 *    Kept a bunch of the original code, but it now draws traditional "Grid Paper Lines" instead.
 */

import * as React from "react";
import { useMemo } from "react";

//ORIGINAL LIBRARY IMPORTS (DOESN'T WORK - THEY'RE CHUNKS IN THE LIBRARY FOLDER):
// import { calcGridCellDimensions } from "../core/calculate.js";
// import type { GridCellConfig } from "../core/calculate.js";

interface GridBounds{
  gridLeft: number;
  gridTop: number;
  gridWidth: number;
  gridHeight: number;
  gridRight: number;
  gridBottom: number;
}
interface GridCellDimensions{
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  gapX: number;
  gapY: number;
  cols: number;
  containerWidth: number;
}

//Re-implement calcGridCellDimensions where we can access it 
function calcGridCellDimensions(config) {
  const {
    width,
    cols,
    rowHeight,
    margin = [10, 10],
    containerPadding
  } = config;

  //Calculate padding and cell dimensions.
  const padding = containerPadding ?? margin;
  const cellWidth = (width - padding[0] * 2 - margin[0] * (cols - 1)) / cols;
  const cellHeight = rowHeight;
  return {
    cellWidth,
    cellHeight,
    offsetX: padding[0],
    offsetY: padding[1],
    gapX: margin[0],
    gapY: margin[1],
    cols,
    containerWidth: width
  };
}

export default function ModifiedGridBackground({
  width, //Container width in PX
  cols, //Number of columns in the grid
  rowHeight, //Height of each row in PX
  margin = [10, 10],  //Margin obj
  containerPadding = [5, 14],  //Padding obj
  rows = 10, //Number of rows in the grid  << Internally has an "Auto"?
  height, //Height of the container in PX
  color = "#e0e0e0", //Color of the grid lines returned
  strokeWidth = 1, //Width of the grid lines returned
  className, 
  style
}) {
  const dims: GridCellDimensions = useMemo(
    () =>
      calcGridCellDimensions({
        width,
        cols,
        rowHeight,
        margin,
        containerPadding
      }),
    [width, cols, rowHeight, margin, containerPadding]
  );

  // Calculate number of rows
  const rowCount: number = useMemo(() => {
    if (height) {
      // Calculate rows that fit in the given height
      const padding = containerPadding ?? margin;
      return Math.ceil(
        (height - padding[1] * 2 + margin[1]) / (rowHeight + margin[1])
      );
    }
    return 10;
  }, [rows, height, rowHeight, margin, containerPadding]);

  // Calculate total height
  const totalHeight: number = useMemo(() => {
    const padding = containerPadding ?? margin;
    return padding[1] * 2 + rowCount * rowHeight + (rowCount - 1) * margin[1];
  }, [rowCount, rowHeight, margin, containerPadding]);


  //Calculate grid boundaries:
  const gridBounds: GridBounds = useMemo(() => {
    
    //Get our dims from the thingy above
    const { cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } = dims;

    //Specify significant points of the grid
    const gridLeft = offsetX;
    const gridTop = offsetY;
    const gridWidth = cols * cellWidth + (cols - 1) * gapX;
    const gridHeight = rowCount * cellHeight + (rowCount - 1) * gapY;
    const gridRight = gridLeft + gridWidth;
    const gridBottom = gridTop + gridHeight;

    return {
      gridLeft,
      gridTop,
      gridWidth,
      gridHeight,
      gridRight,
      gridBottom
    };
  }, [dims, cols, rowCount]);

  // //Traditional Grid version instead of cells:
  const lines = useMemo(() => {
    const elements: React.ReactElement[] = [];
    
    const { gridLeft, gridTop, gridWidth, gridHeight, gridRight, gridBottom } = gridBounds;
    const stepX = cols > 0 ? gridWidth / cols : 0;
    const stepY = rowCount > 0 ? gridHeight / rowCount : 0;

    //Vertical Lines:
    for (let col = 0; col <= cols; col++){
      const x = gridLeft + (col * stepX); //Starting position + (N steps)

      elements.push(
        <line
          key={`vertical-${col}`}
          x1={x}
          y1={gridTop}
          x2={x}
          y2={gridBottom}
          stroke={color}
          strokeWidth={strokeWidth}
          // vectorEffect="non-scaling-stroke" //Autocomplete suggested this? What does it do.
        />
      );
    }

    //Horizontal Lines:
    for (let row = 0; row <= rowCount; row++){
      const y = gridTop + (row * stepY); //Starting position + (N steps)

      elements.push(
        <line
          key={`horizontal-${row}`}
          x1={gridLeft}
          y1={y}
          x2={gridRight}
          y2={y}
          stroke={color}
          strokeWidth={strokeWidth}
          // vectorEffect="non-scaling-stroke" //Autocomplete suggested this? What does it do.
          />
      );
    }

    return elements;
  }, [gridBounds, cols, rowCount, color, strokeWidth]);

//
// ORIGINAL VERSION --> RETURNS SHADED-IN CELLS INSTEAD OF LINES.


//   // const cells = useMemo(() => {
  //   const rects: React.ReactElement[] = [];
  //   const { cellWidth, cellHeight, offsetX, offsetY, gapX, gapY } = dims;

  //   for (let row = 0; row < rowCount; row++) {
  //     for (let col = 0; col < cols; col++) {
  //       const x = offsetX + col * (cellWidth + gapX);
  //       const y = offsetY + row * (cellHeight + gapY);

  //       rects.push(
  //         <rect
  //           key={`${row}-${col}`}
  //           x={x}
  //           y={y}
  //           width={cellWidth}
  //           height={cellHeight}
  //           rx={borderRadius}
  //           ry={borderRadius}
  //           fill={color}
  //         />
  //       );
  //     }
  //   }

  //   return rects;
  // }, [dims, rowCount, cols, borderRadius, color]);

  return (
    <svg
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: width,
        height: totalHeight,
        pointerEvents: "none",
        ...style
      }}
      aria-hidden="true"
    >
      {lines }
    </svg>
  );
}