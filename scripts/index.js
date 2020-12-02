'use strict';

const regexDataPrototype = /(?<=data-prototype=")(.*)(?=">)/;

function toNodeList(elements) {
    let list;
    for (let elm of elements) {
        elm.setAttribute('wrapNodeList', '');
        list = document.querySelectorAll('[wrapNodeList]');
        elm.removeAttribute('wrapNodeList');
    }
    return list;
}

function replaceIndexDom(el, index, name) {
    for (let attr of ['for', 'name', 'id']) {
        if (el.hasAttribute(attr)) {
            el.setAttribute(attr, el.getAttribute(attr).replace('__name__', index))
        }
    }
    if (el.textContent === '__name__label__') {
        el.textContent = el.textContent.replace('__name__label__', index + ' ' + name);
    }
}

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function replaceIndexSubPrototype(text, index) {
    const match = text.match(regexDataPrototype);
    if (match !== null && match.hasOwnProperty('0')) {
        const array = match[0].split('quot;');
        for (let i = 0; i < array.length; i++) {
            if (i > 0 && array[i - 1].endsWith('data-prototype=')) {
                array[i] = replaceIndexSubPrototype(array[i], index);
            } else {
                if (!array[i].includes("__name__label__")) {
                    array[i] = array[i].replace('__name__', index);
                }
            }
        }
        return text.replace(match[0], array.join('quot;'));
    }
    return text;
}

const symfonyFormCollectionAdd = (selector, index, name = '') => {
    let sources;
    if (typeof selector === 'string') {
        sources = document.querySelectorAll(selector);
    } else {
        if (typeof selector.length === 'number') { // handle jQuery
            const arr = [];
            for (let elm of selector) {
                arr.push(elm);
            }
            sources = toNodeList(arr);
        } else {
            sources = toNodeList([selector]);
        }
    }
    const result = [];
    sources.forEach((source) => {
        if (!source.hasAttribute('data-prototype')) {
            console.log(source, ' doesn\'t have a data-prototype attribute');
            result.push(false);
        } else {
            let textDataPrototype = source.getAttribute('data-prototype');
            textDataPrototype = replaceIndexSubPrototype(textDataPrototype, index);
            const domDataPrototype = createElementFromHTML(textDataPrototype);
            domDataPrototype.querySelectorAll('*').forEach((el) => {
                replaceIndexDom(el, index, name);
            });
            result.push(domDataPrototype.innerHTML);
        }
    });
    return result;
};

module.exports = symfonyFormCollectionAdd;
