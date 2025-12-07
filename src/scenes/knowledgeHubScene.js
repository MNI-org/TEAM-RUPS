import Phaser from 'phaser';

export default class KnowledgeHubScene extends Phaser.Scene {
    constructor() {
        super('KnowledgeHubScene');
    }

    preload() {
        // naloži slike komponent
        this.load.image('battery', 'src/components/battery.png');
        this.load.image('lamp', 'src/components/lamp.png');
        this.load.image('resistor', 'src/components/resistor.png');
        this.load.image('switch-off', 'src/components/switch-off.png');
        this.load.image('wire', 'src/components/wire.png');
        this.load.image('ammeter', 'src/components/ammeter.png');
        this.load.image('voltmeter', 'src/components/voltmeter.png');
    }

    create() {
        const { width, height } = this.cameras.main;

        // ozadje podobno kot v laboratorijski sceni
        this.add.rectangle(0, 0, width, height, 0xf0f0f0).setOrigin(0);

        // naslov
        this.add.text(width / 2, 40, 'Knjižnica znanja', {
            fontSize: '42px',
            color: '#222',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // podnaslov
        this.add.text(width / 2, 85, 'Spoznaj električne komponente', {
            fontSize: '20px',
            color: '#555'
        }).setOrigin(0.5);

        // ustvari območje za vsebino
        const contentStartY = 125;
        const componentSpacing = 105;

        // definiraj električne komponente z izobraževalnimi opisi
        const components = [
            {
                name: 'Baterija',
                image: 'battery',
                description: 'Vir napetosti, ki pretvarja kemijsko energijo v električno. Ustvarja razliko potencialov med pozitivnim (+) in negativnim (-) polom, kar povzroči tok elektronov skozi vezje. Napetost se meri v voltih (V).'
            },
            {
                name: 'Žarnica',
                image: 'lamp',
                description: 'Porabnik električne energije, ki svetlobo oddaja, ko skoznjo teče električni tok. Deluje na principu segrevanja žarilne nitke, ki pri visoki temperaturi seva svetlobo. Moč se meri v vatih (W).'
            },
            {
                name: 'Upor',
                image: 'resistor',
                description: 'Komponenta, ki omejuje tok v vezju. Upor pretvarja električno energijo v toplotno energijo. Upornost se meri v ohmih (Ω). Po Ohmovem zakonu velja: U = R × I.'
            },
            {
                name: 'Stikalo',
                image: 'switch-off',
                description: 'Naprava za prekinjanje ali vzpostavljanje električnega toka v vezju. V odprtem stanju prekinjena električna povezava, v zaprtem stanju pa omogoča pretok toka skozi vezje.'
            },
            {
                name: 'Žica',
                image: 'wire',
                description: 'Vodnik, ki povezuje komponente v vezju. Običajno izdelana iz bakra ali aluminija, saj imata nizko upornost. Omogoča pretok električnega toka med komponentami.'
            },
            {
                name: 'Ampermeter',
                image: 'ammeter',
                description: 'Merilni instrument za merjenje jakosti električnega toka. Veže se zaporedno v vezje. Meri tok v amperih (A). Ima zelo nizko notranjo upornost, da ne vpliva na tok v vezju.'
            },
            {
                name: 'Voltmeter',
                image: 'voltmeter',
                description: 'Merilni instrument za merjenje napetosti med dvema točkama v vezju. Veže se vzporedno z elementom, na katerem merimo napetost. Meri v voltih (V). Ima zelo visoko notranjo upornost.'
            }
        ];

        // prikaži komponente v mrežni postavitvi
        const leftColumnX = 180;
        const rightColumnX = width - 480;
        let currentY = contentStartY;
        let isLeftColumn = true;

        components.forEach((comp, index) => {
            const x = isLeftColumn ? leftColumnX : rightColumnX;

            // slika komponente
            const img = this.add.image(x - 100, currentY + 35, comp.image)
                .setScale(0.25)
                .setOrigin(0.5);

            // ime komponente
            this.add.text(x - 10, currentY, comp.name, {
                fontSize: '24px',
                color: '#222',
                fontStyle: 'bold'
            }).setOrigin(0, 0);

            // opis komponente
            this.add.text(x - 10, currentY + 25, comp.description, {
                fontSize: '14px',
                color: '#444',
                wordWrap: { width: 420 }
            }).setOrigin(0, 0);

            // nariši ločilno črto
            const lineY = currentY + 90;
            const lineGraphics = this.add.graphics();
            lineGraphics.lineStyle(1, 0xcccccc, 1);
            lineGraphics.beginPath();
            lineGraphics.moveTo(x - 170, lineY);
            lineGraphics.lineTo(x + 420, lineY);
            lineGraphics.strokePath();

            // izmenjuj med levim in desnim stolpcem
            if (!isLeftColumn) {
                currentY += componentSpacing;
            }
            isLeftColumn = !isLeftColumn;
        });

        // gumb nazaj
        const buttonWidth = 180;
        const buttonHeight = 45;
        const cornerRadius = 10;
        const backButtonX = 60;
        const backButtonY = 30;

        const backButtonBg = this.add.graphics();
        backButtonBg.fillStyle(0x3399ff, 1);
        backButtonBg.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, cornerRadius);

        const backButton = this.add.text(backButtonX + buttonWidth / 2, backButtonY + buttonHeight / 2, '↩ Nazaj', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                backButtonBg.clear();
                backButtonBg.fillStyle(0x0f5cad, 1);
                backButtonBg.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, cornerRadius);
            })
            .on('pointerout', () => {
                backButtonBg.clear();
                backButtonBg.fillStyle(0x3399ff, 1);
                backButtonBg.fillRoundedRect(backButtonX, backButtonY, buttonWidth, buttonHeight, cornerRadius);
            })
            .on('pointerdown', () => {
                this.scene.start('LabScene');
            });
    }
}
