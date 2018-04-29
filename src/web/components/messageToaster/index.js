import { Position, Toaster } from "@blueprintjs/core";

let messageToasterInstance = false;
export default () => messageToasterInstance || (messageToasterInstance = Toaster.create({
    className: 'my-toaster',
    position: Position.TOP_RIGHT
}));