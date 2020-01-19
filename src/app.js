const colors = ['blue', 'green', 'white', 'yellow', 'orange', 'red'],
    pieces = document.getElementsByClassName('piece'),
    socket = io('https://mobi.iwantproject.com.br');

var socketEmit = (data) => {
    socket.emit('data', data);
}

var mx = (i, j) => {
    return ([2, 4, 3, 5][j % 4 | 0] + i % 2 * ((j | 0) % 4 * 2 + 3) + 2 * (i / 2 | 0)) % 6;
}

var getAxis = (face) => {
    return String.fromCharCode('X'.charCodeAt(0) + face / 2);
}

var assembleCube = () => {
    var moveTo = (face) => {
        id = id + (1 << face);
        pieces[i].children[face]
            .appendChild(document.createElement('div'))
            .setAttribute('class', 'sticker ' + colors[face]);
        return 'translate' + getAxis(face) + '(' + (face % 2 * 4 - 2) + 'em)';
    }
    for (var id, x, i = 0; id = 0, i < 26; i++) {
        x = mx(i, i % 18);
        let mv = moveTo(i % 6) + (i > 5 ? moveTo(x) + (i > 17 ? moveTo(mx(x, x + 2)) : '') : '');
        pieces[i].style.transform = 'rotateX(0deg)' + mv;
        pieces[i].setAttribute('id', 'piece' + id);
    }
}

var getPieceBy = (face, index, corner) => {
    let id = ((1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner);
    return document.getElementById('piece' + id);
}

var swapPieces = (face, times) => {
    for (var i = 0; i < 6 * times; i++) {
        var piece1 = getPieceBy(face, i / 2, i % 2),
            piece2 = getPieceBy(face, i / 2 + 1, i % 2);
        for (var j = 0; j < 5; j++) {
            var sticker1 = piece1.children[j < 4 ? mx(face, j) : face].firstChild,
                sticker2 = piece2.children[j < 4 ? mx(face, j + 1) : face].firstChild,
                className = sticker1 ? sticker1.className : '';
            if (className)
                sticker1.className = sticker2.className,
                sticker2.className = className;
        }
    }
}

var animateRotation = (face, cw, currentTime) => {
    var k = .3 * (face % 2 * 2 - 1) * (2 * cw - 1),
        qubes = Array(9).fill(pieces[face]).map((value, index) => {
            return index ? getPieceBy(face, index / 2, index % 2) : value;
        });
    (rotatePieces = () => {
        var passed = Date.now() - currentTime,
            style = 'rotate' + getAxis(face) + '(' + k * passed * (passed < 300) + 'deg)';
        qubes.forEach((piece) => {
            piece.style.transform = piece.style.transform.replace(/rotate.\(\S+\)/, style);
        });
        if (passed >= 300)
            return swapPieces(face, 3 - 2 * cw);
        requestAnimationFrame(rotatePieces);
    })();
}

var mousedown = (md_e) => {
    var startXY = pivot.style.transform.match(/-?\d+\.?\d*/g).map(Number),
        element = md_e.target.closest('.element'),
        face = [].indexOf.call((element || cube).parentNode.children, element);

    var mousemove = (mm_e) => {
        if (element) {
            var gid = /\d/.exec(document.elementFromPoint(mm_e.pageX, mm_e.pageY).id);
            if (gid && gid.input.includes('anchor')) {
                mouseup();
                var e = element.parentNode.children[mx(face, Number(gid) + 3)].hasChildNodes();
                socketEmit({
                    app: 'rubik',
                    action: 'move_piece',
                    content: {
                        mx: mx(face, Number(gid) + 1 + 2 * e),
                        el: e,
                        timestamp: Date.now()
                    }
                });
            }
        } else {
            socketEmit({
                app: 'rubik',
                action: 'move_cube',
                content: {
                    rotateX: (startXY[0] - (mm_e.pageY - md_e.pageY) / 2),
                    rotateY: (startXY[1] + (mm_e.pageX - md_e.pageX) / 2)
                }
            });
        }
    }

    var mouseup = () => {
        document.body.appendChild(guide);
        scene.removeEventListener('mousemove', mousemove);
        scene.removeEventListener('touchmove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        document.removeEventListener('touchend', mouseup);
        scene.addEventListener('mousedown', mousedown);
        scene.addEventListener('touchstart', mousedown);
    }

    (element || document.body).appendChild(guide);
    scene.addEventListener('mousemove', mousemove);
    scene.addEventListener('touchmove', mousemove);
    document.addEventListener('mouseup', mouseup);
    document.addEventListener('touchend', mouseup);
}

document.ondragstart = () => {
    return false;
}

window.addEventListener('load', assembleCube);
scene.addEventListener('mousedown', mousedown);
scene.addEventListener('touchstart', mousedown);

var randomize = () => {

    var overlay = document.createElement('div')
    document.body.appendChild(overlay).setAttribute('class', 'overlay');

    var times = 10;
    for (var i = 0; i < times; i++) {
        ((j) => {
            setTimeout(() => {
                socketEmit({
                    app: 'rubik',
                    action: 'move_piece',
                    content: {
                        mx: Math.floor(Math.random() * 6),
                        el: Math.random() >= 0.5,
                        timestamp: Math.floor(Date.now() * Math.random())
                    }
                });
                if (times === j + 1) {
                    document.body.removeChild(overlay);
                }
            }, i * 80);
        })(i);
    }
}

var randomizeButton = document.getElementById('randomize');
randomizeButton.addEventListener('click', randomize, false);

socket.on('data', (data) => {
    if (data.app != 'rubik') return;
    if (data.action === 'move_piece') {
        animateRotation(data.content.mx, data.content.el, data.content.timestamp);
    }
    if (data.action === 'move_cube') {
        let x = data.content.rotateX;
        let y = data.content.rotateY;
        pivot.style.transform = 'rotateX(' + x + 'deg) rotateY(' + y + 'deg)';
    }
});