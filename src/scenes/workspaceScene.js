// javascript
import Phaser from 'phaser';
import LabScene from './labScene';
import { Battery } from '../components/battery';
import { Bulb } from '../components/bulb';
import { Wire } from '../components/wire';
import { CircuitGraph } from '../logic/circuit_graph';
import { Node } from '../logic/node';
import { Switch } from '../components/switch';
import { Resistor } from '../components/resistor';

export default class WorkspaceScene extends Phaser.Scene {
    constructor() {
        super('WorkspaceScene');
        this.root = null; // container for resizeable layout
    }

    init() {
        const savedIndex = localStorage.getItem('currentChallengeIndex');
        this.currentChallengeIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
    }

    preload() {
        this.graph = new CircuitGraph();
        this.load.image('baterija', 'src/components/battery.png');
        this.load.image('upor', 'src/components/resistor.png');
        this.load.image('svetilka', 'src/components/lamp.png');
        this.load.image('stikalo-on', 'src/components/switch-on.png');
        this.load.image('stikalo-off', 'src/components/switch-off.png');
        this.load.image('žica', 'src/components/wire.png');
        this.load.image('ampermeter', 'src/components/ammeter.png');
        this.load.image('voltmeter', 'src/components/voltmeter.png');
        this.load.image('baterija_on', 'src/components/on_battery.png');
        this.load.image('upor_on', 'src/components/on_resistor.png');
        this.load.image('svetilka_on', 'src/components/on_lamp.png');
        this.load.image('stikalo-on_on', 'src/components/on_switch-on.png');
        this.load.image('stikalo-off_on', 'src/components/on_switch-off.png');
        this.load.image('žica_on', 'src/components/on_wire.png');
        this.load.image('ampermeter_on', 'src/components/on_ammeter.png');
        this.load.image('voltmeter_on', 'src/components/on_voltmeter.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        // keys
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyDelete = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);

        // selection
        this.selectedComponent = null;

        // delete on Delete key
        this.input.keyboard.on('keydown-DELETE', () => {
            if (!this.selectedComponent || this.selectedComponent.getData('isInPanel')) return;

            const comp = this.selectedComponent.getData('logicComponent');
            if (comp) {
                if (this.graph.removeComponent) this.graph.removeComponent(comp);
                if (comp.start && this.graph.removeNode) this.graph.removeNode(comp.start);
                if (comp.end && this.graph.removeNode) this.graph.removeNode(comp.end);
            }

            const idx = this.placedComponents.indexOf(this.selectedComponent);
            if (idx !== -1) this.placedComponents.splice(idx, 1);

            this.selectedComponent.destroy();
            this.selectedComponent = null;
        });

        // root container for everything that should resize
        this.root = this.add.container(0, 0);

        this.infoWindow = this.add.container(0, 0);
        this.infoWindow.setDepth(1000);
        this.infoWindow.setVisible(false);

        // ozadje info okna
        const infoBox = this.add.rectangle(0, 0, 200, 80, 0x2c2c2c, 0.95);
        infoBox.setStrokeStyle(2, 0xffffff);
        const infoText = this.add.text(0, 0, '', {
            fontSize: '14px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: 180 }
        }).setOrigin(0.5);

        this.infoWindow.add([infoBox, infoText]);
        this.infoText = infoText;

        this.challenges = [
            {
                prompt: 'Sestavi preprosti električni krog z baterijo in svetilko.',
                requiredComponents: ['baterija', 'svetilka', 'žica', 'žica', 'žica', 'žica', 'žica', 'žica'],
                theory: ['Osnovni električni krog potrebuje vir, to je v našem primeru baterija. Potrebuje tudi porabnike, to je svetilka. Električni krog je v našem primeru sklenjen, kar je nujno potrebno, da električni tok teče preko prevodnikov oziroma žic.']
            },
            {
                prompt: 'Sestavi preprosti nesklenjeni električni krog z baterijo, svetilko in stikalom.',
                requiredComponents: ['baterija', 'svetilka', 'žica', 'stikalo-off'],
                theory: ['V nesklenjenem krogu je stikalo odprto, kar pomeni, da je električni tok prekinjen. Svetilka posledično zato ne sveti.']
            },
            {
                prompt: 'Sestavi preprosti sklenjeni električni krog z baterijo, svetilko in stikalom.',
                requiredComponents: ['baterija', 'svetilka', 'žica', 'stikalo-on'],
                theory: ['V sklenjenem krogu je stikalo zaprto, kar pomeni, da lahko električni tok teče neovirano. Torej v tem primeru so vrata zaprta.']
            },
            {
                prompt: 'Sestavi električni krog z baterijo, svetilko in stikalom, ki ga lahko ugašaš in prižigaš.',
                requiredComponents: ['baterija', 'svetilka', 'žica', 'stikalo-on', 'stikalo-off'],
                theory: ['Stikalo nam omogoča nadzor nad pretokom električnega toka. Ko je stikalo zaprto, tok teče in posledično svetilka sveti. Kadar pa je stikalo odprto, tok ne teče in se svetilka ugasne. To lahko primerjamo z vklapljanjem in izklapljanjem električnih naprav v naših domovih.']
            },
            {
                prompt: 'Sestavi krog z dvema baterijama in svetilko. ',
                requiredComponents: ['baterija', 'baterija', 'svetilka', 'žica'],
                theory: ['Kadar vežemo dve ali več baterij zaporedno, se napetosti seštevajo. Večja je napetost, večji je električni tok. V našem primeru zato svetilka sveti močneje.']
            },
            {
                prompt: 'V električni krog zaporedno poveži dve svetilki, ki ju priključiš na baterijo. ',
                requiredComponents: ['baterija', 'svetilka', 'svetilka', 'žica'],
                theory: ['V zaporedni vezavi teče isti električni tok skozi vse svetilke. Napetost baterije se porazdeli. Če imamo primer, da ena svetilka preneha delovati, bo ta prekinila tok skozi drugo svetilko.']
            },

            {
                prompt: 'V električni krog vzporedno poveži dve svetilki, ki ju priključiš na baterijo. ',
                requiredComponents: ['baterija', 'svetilka', 'svetilka', 'žica'],
                theory: ['V vzporedni vezavi ima vsaka svetilka enako napetost kot baterija. Eletrični tok se porazdeli med svetilkami. Če ena svetilka preneha delovati, bo druga še vedno delovala.']
            },
            {
                prompt: 'Sestavi električni krog s svetilko in uporom. ',
                requiredComponents: ['baterija', 'svetilka', 'žica', 'upor'],
                theory: ['Upor omejuje tok v krogu. Večji kot je upor, manjši je tok. Spoznajmo Ohmov zakon: tok (I) = napetost (U) / upornost (R). Svetilka bo svetila manj intenzivno, saj skozi njo teče manjši tok.']
            },

        ];

        // shrani komponente na mizi
        this.placedComponents = [];
        this.gridSize = 40;

        this.runSimulacija = false;
        this.sim = undefined;

        // build initial layout
        this.buildLayout(width, height);

        // interval za simulacijo
        if (!this.intervalSet) {
            setInterval(() => {
                if (this.runSimulacija)
                    this.connected = this.graph.simulate();
            }, 2000);
            this.intervalSet = true;
        }

        console.log(JSON.parse(localStorage.getItem('users')));

        this.input.keyboard.on('keydown-ESC', () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('LabScene');
            });
        });

        // handle resize
        this.scale.on('resize', (gameSize) => {
            const w = gameSize.width;
            const h = gameSize.height;
            if (!w || !h) return;

            if (this.root) {
                this.root.removeAll(true); // destroy old layout objects
            }

            this.buildLayout(w, h);
        });
    }

    buildLayout(width, height) {
        const root = this.root;

        // desk background
        const desk = this.add.rectangle(0, 0, width, height, 0xe0c9a6).setOrigin(0);
        root.add(desk);

        // grid
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x8b7355, 0.35);
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, height);
            gridGraphics.strokePath();
        }
        for (let y = 0; y < height; y += gridSize) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(width, y);
            gridGraphics.strokePath();
        }
        root.add(gridGraphics);

        if (this.promptText) this.promptText.destroy();
        if (this.checkText) this.checkText.destroy();

        const maxPromptWidth = Math.min(width - 220, 600);

        // checkText on top
        this.checkText = this.add.text(
            width / 2,
            height - 90,
            '',
            {
                fontFamily: 'Arial',
                fontSize: width < 700 ? '16px' : '18px',
                color: '#cc0000',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: maxPromptWidth },
                backgroundColor: '#ffffffcc',
                padding: { x: 18, y: 8 }
            }
        )
            .setOrigin(0.5);
        root.add(this.checkText);

        // promptText at bottom
        this.promptText = this.add.text(
            width / 2,
            height - 40,
            this.challenges[this.currentChallengeIndex].prompt,
            {
                fontFamily: 'Arial',
                fontSize: width < 700 ? '16px' : '18px',
                color: '#222222',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: maxPromptWidth },
                backgroundColor: '#ffffffcc',
                padding: { x: 18, y: 10 }
            }
        )
            .setOrigin(0.5);
        root.add(this.promptText);

        // buttons
        const buttonWidth = 180;
        const buttonHeight = 45;
        const cornerRadius = 10;

        const makeButton = (x, y, label, onClick) => {
            const bg = this.add.graphics();
            bg.fillStyle(0x3399ff, 1);
            bg.fillRoundedRect(
                x - buttonWidth / 2,
                y - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
            root.add(bg);

            const text = this.add.text(x, y, label, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => text.setStyle({ color: '#e6f2ff' }))
                .on('pointerout', () => text.setStyle({ color: '#ffffff' }))
                .on('pointerdown', onClick);

            root.add(text);
            return { bg, text };
        };

        makeButton(width - 140, 75, 'Lestvica', () =>
            this.scene.start('ScoreboardScene', { cameFromMenu: false })
        );

        makeButton(width - 140, 125, 'Preveri krog', () => this.checkCircuit());

        makeButton(width - 140, 175, 'Simulacija', () => {
            this.connected = this.graph.simulate();
            if (this.connected === 1) {
                this.checkText.setStyle({ color: '#00aa00' });
                this.checkText.setText('Električni tok je sklenjen.');
                this.checkText.setVisible(true);
                this.sim = true;
                return;
            }
            this.checkText.setStyle({ color: '#cc0000' });
            if (this.connected === -1) {
                this.checkText.setText('Manjka ti baterija.');
            } else if (this.connected === -2) {
                this.checkText.setText('Stikalo je izklopljeno.');
            } else if (this.connected === 0) {
                this.checkText.setText('Električni tok ni sklenjen.');
            }
            this.checkText.setVisible(true);
            this.sim = false;
        });

        const simulBtn = makeButton(width - 140, 225, 'Začni simulacijo', () => {
            this.runSimulacija = !this.runSimulacija;
            if (this.runSimulacija) {
                simulBtn.text.setText('Ustavi simulacijo');
            } else {
                simulBtn.text.setText('Začni simulacijo');
            }
        });

        const panelWidth = 150;
        const side1 = this.add.rectangle(0, 0, panelWidth, height, 0xc0c0c0).setOrigin(0);
        const side2 = this.add.rectangle(0, 0, panelWidth, height, 0x000000, 0.2).setOrigin(0);
        root.add(side1);
        root.add(side2);

        const sideTitle = this.add.text(panelWidth / 2, 60, 'Komponente', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        root.add(sideTitle);

        this.createComponent(panelWidth / 2, 100, 'baterija', 0xffcc00);
        this.createComponent(panelWidth / 2, 180, 'upor', 0xff6600);
        this.createComponent(panelWidth / 2, 260, 'svetilka', 0xff0000);
        this.createComponent(panelWidth / 2, 340, 'stikalo-on', 0x666666);
        this.createComponent(panelWidth / 2, 420, 'stikalo-off', 0x666666);
        this.createComponent(panelWidth / 2, 500, 'žica', 0x0066cc);
        this.createComponent(panelWidth / 2, 580, 'ampermeter', 0x00cc66);
        this.createComponent(panelWidth / 2, 660, 'voltmeter', 0x00cc66);

        const maxTopWidth = Math.min(width - 160, 700);
        const topText = this.add.text(
            width / 2 + 50,
            30,
            'Povleci komponente na mizo in zgradi svoj električni krog!',
            {
                fontSize: '20px',
                color: '#333',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: '#ffffff88',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5);
        root.add(topText);

        // back button
        const backButton = this.add.text(16, 14, '↩ Nazaj', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#387affff',
            padding: { x: 12, y: 6 }
        })
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => backButton.setStyle({ color: '#0054fdff' }))
            .on('pointerout', () => backButton.setStyle({ color: '#387affff' }))
            .on('pointerdown', () => {
                this.cameras.main.fade(300, 0, 0, 0);
                this.time.delayedCall(300, () => this.scene.start('LabScene'));
            });
        root.add(backButton);
    }

    getComponentDetails(type) {
        const details = {
            'baterija': 'Napetost: 3.3 V\nVir električne energije',
            'upor': 'Uporabnost: omejuje tok\nMeri se v ohmih (Ω)',
            'svetilka': 'Pretvarja električno energijo v svetlobo',
            'stikalo-on': 'Dovoljuje pretok toka',
            'stikalo-off': 'Prepreči pretok toka',
            'žica': 'Povezuje komponente\nKlikni za obračanje',
            'ampermeter': 'Meri električni tok\nEnota: amperi (A)',
            'voltmeter': 'Meri električno napetost\nEnota: volti (V)'
        };
        return details[type] || 'Komponenta';
    }

    createGrid() {
        const { width, height } = this.cameras.main;
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(2, 0x8b7355, 0.4);

        const gridSize = 40;
        const startX = 200;

        // vertikalne črte
        for (let x = startX; x < width; x += gridSize) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, height);
            gridGraphics.strokePath();
        }

        // horizontalne črte
        for (let y = 0; y < height; y += gridSize) {
            gridGraphics.beginPath();
            gridGraphics.moveTo(startX, y);
            gridGraphics.lineTo(width, y);
            gridGraphics.strokePath();
        }
    }

    snapToGrid(x, y) {
        const gridSize = this.gridSize;
        const startX = 200;

        const snappedX = Math.round((x - startX) / gridSize) * gridSize + startX;
        const snappedY = Math.round(y / gridSize) * gridSize;

        return { x: snappedX, y: snappedY };
    }

    getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
    }

    updateLogicNodePositions(component) {
        const comp = component.getData('logicComponent');
        if (!comp) return;

        const halfW = 40;
        const halfH = 40;
        const localStart = comp.localStart || { x: -halfW, y: 0 };
        const localEnd = comp.localEnd || { x: halfW, y: 0 };

        const theta = (typeof component.rotation === 'number' && component.rotation)
            ? component.rotation
            : Phaser.Math.DegToRad(component.angle || 0);
        console.log('Component:', comp);

        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const rotate = (p) => ({
            x: Math.round(p.x * cos - p.y * sin),
            y: Math.round(p.x * sin + p.y * cos)
        });

        const rStart = rotate(localStart);
        const rEnd = rotate(localEnd);

        const worldStart = { x: component.x + rStart.x, y: component.y + rStart.y };
        const worldEnd = { x: component.x + rEnd.x, y: component.y + rEnd.y };

        const snappedStart = this.snapToGrid(worldStart.x, worldStart.y);
        const snappedEnd = this.snapToGrid(worldEnd.x, worldEnd.y);

        if (comp.start) {
            comp.start.x = snappedStart.x;
            comp.start.y = snappedStart.y;
            if (!comp.start.connected) comp.start.connected = new Set();
            this.graph.addNode(comp.start);
        }
        if (comp.end) {
            comp.end.x = snappedEnd.x;
            comp.end.y = snappedEnd.y;
            if (!comp.end.connected) comp.end.connected = new Set();
            this.graph.addNode(comp.end);
        }

        const startDot = component.getData('startDot');
        const endDot = component.getData('endDot');
        if (startDot && comp.start) { startDot.x = comp.start.x; startDot.y = comp.start.y; }
        if (endDot && comp.end) { endDot.x = comp.end.x; endDot.y = comp.end.y; }
    }

    createComponent(x, y, type, color) {
        const component = this.add.container(x, y);
        this.input.mouse.disableContextMenu();
        let comp = null;
        let componentImage;
        let id;

        switch (type) {
            case 'baterija':
                id = 'bat_' + this.getRandomInt(1000, 9999);
                comp = new Battery(
                    id,
                    new Node(id + '_start', -40, 0),
                    new Node(id + '_end', 40, 0),
                    3.3
                );
                comp.type = 'battery';
                comp.localStart = { x: -40, y: 0 };
                comp.localEnd = { x: 40, y: 0 };
                componentImage = this.add.image(0, 0, 'baterija')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);

                comp.container = component;
                comp.image = componentImage;

                component.setData('logicComponent', comp);
                break;

            case 'upor':
                id = 'res_' + this.getRandomInt(1000, 9999);
                comp = new Resistor(
                    id,
                    new Node(id + '_start', -40, 0),
                    new Node(id + '_end', 40, 0),
                    1.5
                );
                comp.type = 'resistor';
                comp.localStart = { x: -40, y: 0 };
                comp.localEnd = { x: 40, y: 0 };
                componentImage = this.add.image(0, 0, 'upor')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);

                comp.container = component;
                comp.image = componentImage;

                component.setData('logicComponent', comp);
                break;

            case 'svetilka':
                id = 'bulb_' + this.getRandomInt(1000, 9999);
                comp = new Bulb(
                    id,
                    new Node(id + '_start', -40, 0),
                    new Node(id + '_end', 40, 0)
                );
                comp.type = 'bulb';
                comp.localStart = { x: -40, y: 0 };
                comp.localEnd = { x: 40, y: 0 };
                componentImage = this.add.image(0, 0, 'svetilka')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);

                comp.container = component;
                comp.image = componentImage;

                component.setData('logicComponent', comp);
                break;

            case 'stikalo-on':
                id = 'switch_' + this.getRandomInt(1000, 9999);
                comp = new Switch(
                    id,
                    new Node(id + '_start', -40, 0),
                    new Node(id + '_end', 40, 0),
                    true
                );
                comp.type = 'switch';
                comp.localStart = { x: -40, y: 0 };
                comp.localEnd = { x: 40, y: 0 };
                componentImage = this.add.image(0, 0, 'stikalo-on')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);

                comp.container = component;
                comp.image = componentImage;

                component.setData('logicComponent', comp);
                break;

            case 'stikalo-off':
                id = 'switch_' + this.getRandomInt(1000, 9999);
                comp = new Switch(
                    id,
                    new Node(id + '_start', -40, 0),
                    new Node(id + '_end', 40, 0),
                    false
                );
                comp.type = 'switch';
                comp.localStart = { x: -40, y: 0 };
                comp.localEnd = { x: 40, y: 0 };
                componentImage = this.add.image(0, 0, 'stikalo-off')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);

                comp.container = component;
                comp.image = componentImage;

                component.setData('logicComponent', comp);
                break;

            case 'žica':
                id = 'wire_' + this.getRandomInt(1000, 9999);
                comp = new Wire(
                    id,
                    new Node(id + '_start', -40, 0),
                    new Node(id + '_end', 40, 0)
                );
                comp.type = 'wire';
                comp.localStart = { x: -40, y: 0 };
                comp.localEnd = { x: 40, y: 0 };
                componentImage = this.add.image(0, 0, 'žica')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);

                comp.container = component;
                comp.image = componentImage;

                component.setData('logicComponent', comp);
                break;

            case 'ampermeter':
                id = 'ammeter_' + this.getRandomInt(1000, 9999);
                componentImage = this.add.image(0, 0, 'ampermeter')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);
                component.setData('logicComponent', null);
                break;

            case 'voltmeter':
                id = 'voltmeter_' + this.getRandomInt(1000, 9999);
                componentImage = this.add.image(0, 0, 'voltmeter')
                    .setOrigin(0.5)
                    .setDisplaySize(100, 100);
                component.add(componentImage);
                component.setData('logicComponent', null);
                break;
        }

        component.on('pointerover', () => {
            if (component.getData('isInPanel')) {
                const details = this.getComponentDetails(type);
                this.infoText.setText(details);

                this.infoWindow.x = x + 120;
                this.infoWindow.y = y;
                this.infoWindow.setVisible(true);
            }
            component.setScale(1.1);
        });

        component.on('pointerout', () => {
            if (component.getData('isInPanel')) {
                this.infoWindow.setVisible(false);
            }
            component.setScale(1);
        });

        const label = this.add.text(0, 30, type, {
            fontSize: '11px',
            color: '#fff',
            backgroundColor: '#00000088',
            padding: { x: 4, y: 2 },
        }).setOrigin(0.5);
        component.add(label);

        component.setSize(70, 70);
        component.setInteractive({ draggable: true, useHandCursor: true });

        component.setData('originalX', x);
        component.setData('originalY', y);
        component.setData('type', type);
        component.setData('color', color);
        component.setData('isInPanel', true);
        component.setData('rotation', 0);
        if (comp) component.setData('logicComponent', comp);
        component.setData('isDragging', false);

        this.input.setDraggable(component);

        component.on('dragstart', () => {
            component.setData('isDragging', true);
        });

        component.on('drag', (pointer, dragX, dragY) => {
            if (this.runSimulacija) return;
            component.x = dragX;
            component.y = dragY;
        });

        component.on('dragend', () => {
            const isInPanel = component.x < 200;

            if (isInPanel && !component.getData('isInPanel')) {
                // case: dragged back to panel -> just destroy the copy
                component.destroy();
            } else if (!isInPanel && component.getData('isInPanel')) {
                // case: new component dragged from panel to workspace
                component.setData('isInPanel', false);

                // hide popup when component is used
                this.infoWindow.setVisible(false);

                // create a fresh panel item to replace the one you used
                const origX = component.getData('originalX');
                const origY = component.getData('originalY');
                const type = component.getData('type');
                const color = component.getData('color');
                this.createComponent(origX, origY, type, color);

                // snap to grid and register in placedComponents / graph
                const snapped = this.snapToGrid(component.x, component.y);
                component.x = snapped.x;
                component.y = snapped.y;

                this.placedComponents.push(component);
                this.updateLogicNodePositions(component);
            } else if (!component.getData('isInPanel')) {
                // case: moving an already placed component
                const snapped = this.snapToGrid(component.x, component.y);
                component.x = snapped.x;
                component.y = snapped.y;
                this.updateLogicNodePositions(component);
            } else {
                // case: still in panel -> reset position
                component.x = component.getData('originalX');
                component.y = component.getData('originalY');
                this.updateLogicNodePositions(component);
            }

            this.time.delayedCall(500, () => {
                component.setData('isDragging', false);
            });
        });

        component.on('pointerdown', (pointer) => {
            // selection
            if (!component.getData('isInPanel')) {
                this.selectedComponent = component;
            }

            if (this.runSimulacija) {
                switch (component.data.list.logicComponent?.type) {
                    case 'switch':
                        component.data.list.logicComponent.is_on =
                            !component.data.list.logicComponent.is_on;
                        const newTexture = component.data.list.logicComponent.is_on
                            ? 'stikalo-on'
                            : 'stikalo-off';
                        component.data.list.logicComponent.image.setTexture(newTexture);
                        break;
                }
                return;
            }

            // rotate on right click
            if (pointer.rightButtonDown()) {
                if (!component.getData('isInPanel')) {
                    const currentRotation = component.getData('rotation');
                    const newRotation = currentRotation === 90 ? 0 : 90;

                    component.setData('rotation', newRotation);

                    const logicComp = component.getData('logicComponent');
                    if (logicComp) logicComp.rotation = newRotation;

                    this.tweens.add({
                        targets: component,
                        angle: newRotation,
                        duration: 150,
                        ease: 'Cubic.easeOut',
                        onComplete: () => {
                            this.updateLogicNodePositions(component);
                        }
                    });
                }
                return;
            }

            // delete on D while clicking a placed component
            if (this.keyD.isDown && !component.getData('isInPanel')) {
                const lc = component.getData('logicComponent');
                if (lc) {
                    if (this.graph.removeComponent) this.graph.removeComponent(lc);
                    if (lc.start && this.graph.removeNode) this.graph.removeNode(lc.start);
                    if (lc.end && this.graph.removeNode) this.graph.removeNode(lc.end);
                }

                const idx = this.placedComponents.indexOf(component);
                if (idx !== -1) this.placedComponents.splice(idx, 1);

                if (this.selectedComponent === component) {
                    this.selectedComponent = null;
                }

                component.destroy();
            }
        });

        // hover efekt
        component.on('pointerover', () => {
            component.setScale(1.1);
        });

        component.on('pointerout', () => {
            component.setScale(1);
        });
    }

    checkCircuit() {
        const currentChallenge = this.challenges[this.currentChallengeIndex];
        const placedTypes = this.placedComponents.map(comp => comp.getData('type'));
        console.log('components', placedTypes);
        this.checkText.setStyle({ color: '#cc0000' });

        if (!currentChallenge.requiredComponents.every(req => placedTypes.includes(req))) {
            this.checkText.setText('Manjkajo komponente za krog.');
            return;
        }

        if (this.sim === undefined) {
            this.checkText.setText('Zaženi simlacijo');
            return;
        }

        if (this.sim === false) {
            this.checkText.setText('Električni krog ni sklenjen. Preveri kako si ga sestavil');
            return;
        }

        this.checkText.setStyle({ color: '#00aa00' });
        this.checkText.setText('Čestitke! Krog je pravilen.');
        this.addPoints(10);

        const currentTheory = currentChallenge.theory;
        if (currentTheory) {
            this.showTheory(currentTheory);
        } else {
            this.checkText.setStyle({ color: '#00aa00' });
            this.checkText.setText('Čestitke! Krog je pravilen.');
            this.addPoints(10);
            this.time.delayedCall(2000, () => this.nextChallenge());
        }
    }

    nextChallenge() {
        this.currentChallengeIndex++;
        localStorage.setItem('currentChallengeIndex', this.currentChallengeIndex.toString());
        this.checkText.setText('');

        if (this.currentChallengeIndex < this.challenges.length) {
            this.promptText.setText(this.challenges[this.currentChallengeIndex].prompt);
        }
        else {
            this.promptText.setText('Vse naloge so uspešno opravljene! Čestitke!');
            localStorage.removeItem('currentChallengeIndex');
        }
    }

    addPoints(points) {
        const user = localStorage.getItem('username');
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userData = users.find(u => u.username === user);
        if (userData) {
            userData.score = (userData.score || 0) + points;
        }
        localStorage.setItem('users', JSON.stringify(users));
    }

    showTheory(theoryText) {
        const { width, height } = this.cameras.main;

        this.theoryBack = this.add.rectangle(width / 2, height / 2, width - 100, 150, 0x000000, 0.8)
            .setOrigin(0.5)
            .setDepth(10);

        this.theoryText = this.add.text(width / 2, height / 2, theoryText, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 150 }
        })
            .setOrigin(0.5)
            .setDepth(11);

        this.continueButton = this.add.text(width / 2, height / 2 + 70, 'Nadaljuj', {
            fontSize: '18px',
            color: '#0066ff',
            backgroundColor: '#ffffff',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setDepth(11)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.continueButton.setStyle({ color: '#0044cc' }))
            .on('pointerout', () => this.continueButton.setStyle({ color: '#0066ff' }))
            .on('pointerdown', () => {
                this.hideTheory();
                this.placedComponents.forEach(comp => comp.destroy());
                this.placedComponents = [];
                this.nextChallenge();
            });
    }

    hideTheory() {
        if (this.theoryBack) {
            this.theoryBack.destroy();
            this.theoryBack = null;
        }
        if (this.theoryText) {
            this.theoryText.destroy();
            this.theoryText = null;
        }
        if (this.continueButton) {
            this.continueButton.destroy();
            this.continueButton = null;
        }
    }
}