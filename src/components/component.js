import { Node } from '../logic/node.js';

class Component {
    constructor(id, type, start, end, image,image_on, isVoltageSource = false) {
        console.log(`Creating component: ${id} of type ${type} between ${start.id} and ${end.id}`);
        this.id = id;
        this.type = type;
        this.start = start;
        this.end = end;
        this.isVoltageSource = isVoltageSource;
        this.image = image
        this.image_on= image_on
        this.debug_color = 0xff0000
    }

    conducts(){
        // Placeholder for component-specific conduction logic
    }
}

export { Component };