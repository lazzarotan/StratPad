import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ZoomPanPinchWrapperProps {
    gridWidth: number;
    initialScale: number;
    setCurrentScale: (scale: number) => void;
    containerRef: React.RefObject<HTMLDivElement>;
    children: React.ReactNode;
}

function isInsideModule(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest(".module-box") !== null;
}

export default function ZoomPanPinchWrapper(props: ZoomPanPinchWrapperProps) {
    const { gridWidth, initialScale, setCurrentScale, containerRef, children } = props;

    return (
        <TransformWrapper
            doubleClick={{ disabled: true }}
            wheel={{ excluded: ["module-box"] }}
            initialScale={initialScale}
            minScale={0.3}
            maxScale={2}
            centerZoomedOut={true}
            centerOnInit={false}
            initialPositionX={0}
            initialPositionY={0}
            limitToBounds={true}
            panning={{ velocityDisabled: true, excluded: ["select", "button", "input", "textarea", "list-item__drag-handle", "resource-bar__track"] }}
            onTransformed={(_ref, state) => setCurrentScale(state.scale)}
            //Cancel the panning action if it originates inside a module
            onPanningStart={(ref, event) => {
                // preventDefault() was already called by the library, which suppresses the browser's
                // natural focus-change (and thus blur) on mousedown. Manually blur the active element
                // so that text fields lose focus when the user clicks outside them.
                (document.activeElement as HTMLElement)?.blur();
                if (isInsideModule((event as any).target)) {
                    ref.instance.clearPanning(event as any); //ClearPanning is a callback included with the lib
                }
            }}
        >
            <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%', overflow: 'hidden' }}
                contentStyle={{
                    width: gridWidth,
                    transformOrigin: '0 0',
                    margin: 0,
                    padding: 0,
                    display: 'block',
                }}
            >
                <div
                >
                    {children}
                </div>
            </TransformComponent>
        </TransformWrapper>
    );
}