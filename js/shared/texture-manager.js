const textureMap = {};

export default class TextureManager {

    static loadTextures(gl, assets) {
        const loaders = [];
        assets.filter(asset => {
            return !textureMap[asset.name] || !textureMap[asset.name].texture
        }).forEach(asset => {
            loaders.push(loadTexture(gl, asset.source).then(textureInfo => {
                textureMap[asset.name] = {
                    texture: textureInfo.texture
                }
            }));
        });

        return Promise.all(loaders);
    }

    static unloadTextures(gl, assets) {
        const rngl = gl.getExtension("RN");
        assets.forEach(asset => {    
            rngl.unloadTexture(textureMap[asset.name].texture);
            delete textureMap[asset.name];            
        });
    }

    static getTexture(name) {
        if (name in textureMap) {
            return textureMap[name].texture
        }
        else {
            return null;
        }
    }
    
}

function loadTexture(gl, assetSource) {
    const rngl = gl.getExtension("RN");
    return rngl.loadTexture({
        image: {
            uri: assetSource
        }
    });
}



