// jsdom has no PointerEvent: the mouse fields come from the MouseEvent constructor, and the two
// pointer fields the drag handlers read are added on top
type Axis = 'x' | 'y'

const pointer = (
    type: string,
    position: number,
    options: { axis?: Axis, pointerType?: string, button?: number } = {}
) =>
    Object.assign(
        new MouseEvent(type, {
            bubbles: true,
            button: options.button ?? 0,
            clientX: (options.axis ?? 'x') === 'x' ? position : 0,
            clientY: (options.axis ?? 'x') === 'y' ? position : 0
        }),
        {
            pointerId: 1,
            pointerType: options.pointerType ?? 'mouse'
        }
    )

/** A whole drag along one axis: press on the element, move past the threshold, let go. */
const dragOn = (element: Element, from: number, to: number, axis: Axis = 'x'): void => {
    element.dispatchEvent(pointer('pointerdown', from, { axis }))
    window.dispatchEvent(pointer('pointermove', to, { axis }))
    window.dispatchEvent(pointer('pointerup', to, { axis }))
}

/** jsdom does no layout, so a rect has to be placed by hand. */
const placeAt = (element: Element, top: number, left = 0): void => {
    element.getBoundingClientRect = () => ({
        top, left, bottom: top, right: left, width: 0, height: 0, x: left, y: top, toJSON: () => ({})
    })
}

export { pointer, dragOn, placeAt }
