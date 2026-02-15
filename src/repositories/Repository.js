export class Repository {
    constructor() {
        this.models = {};
    }
    registerModel(model) {
        this.models[model.name] = model;
    }
}
