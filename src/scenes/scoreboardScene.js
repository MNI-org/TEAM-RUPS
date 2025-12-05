import Phaser from 'phaser';

export default class ScoreboardScene extends Phaser.Scene {
    constructor() {
        super('ScoreboardScene');
        this.cameFromMenu = false;
        this.elements = {};
    }

    init(data) {
        this.cameFromMenu = data.cameFromMenu || false;
    }

    preload() {
        for (let i = 1; i <= 14; i++) {
            this.load.image(`avatar${i}`, `src/avatars/avatar${i}.png`);
        }
    }

    create() {
        const { width, height } = this.scale;

        // container for all display objects so we can clear/rebuild on resize
        this.root = this.add.container(0, 0);

        // initial layout
        this.buildLayout(width, height);

        // listen for resize
        this.scale.on('resize', (gameSize) => {
            const w = gameSize.width;
            const h = gameSize.height;

            // clear old display objects
            this.root.removeAll(true);
            this.buildLayout(w, h);
        });

        // ESC
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.cameFromMenu) {
                this.scene.start('LabScene');
            } else {
                this.scene.start('LabScene');
            }
        });
    }

    buildLayout(width, height) {
        const root = this.root;

        // BACKGROUND (proportional heights)
        const floorHeight = Math.max(120, height * 0.18);
        const wallHeight = height - floorHeight;

        const wall = this.add.rectangle(0, 0, width, wallHeight, 0xe8e8e8).setOrigin(0);
        const floor = this.add.rectangle(0, wallHeight, width, floorHeight, 0xd4c4a8).setOrigin(0);
        root.add([wall, floor]);

        // TABLE (scale with width/height, keep limits)
        const tableWidth = Phaser.Math.Clamp(width * 0.55, 400, 900);
        const tableHeight = Phaser.Math.Clamp(height * 0.35, 220, 420);
        const tableX = width / 2;
        const tableY = height / 2 + tableHeight * 0.15;

        const tableTop = this.add.rectangle(tableX, tableY, tableWidth, 30, 0x8b4513).setOrigin(0.5);
        const surface = this.add.rectangle(
            tableX,
            tableY + 15,
            tableWidth - 30,
            tableHeight - 30,
            0xa0826d
        ).setOrigin(0.5, 0);

        root.add([tableTop, surface]);

        // GRID ON TABLE
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x8b7355, 0.3);
        const gridSize = 30;
        const gridStartX = tableX - (tableWidth - 30) / 2;
        const gridStartY = tableY + 15;
        const gridEndX = tableX + (tableWidth - 30) / 2;
        const gridEndY = tableY + 15 + (tableHeight - 30);

        for (let x = gridStartX; x <= gridEndX; x += gridSize) {
            grid.beginPath();
            grid.moveTo(x, gridStartY);
            grid.lineTo(x, gridEndY);
            grid.strokePath();
        }
        for (let y = gridStartY; y <= gridEndY; y += gridSize) {
            grid.beginPath();
            grid.moveTo(gridStartX, y);
            grid.lineTo(gridEndX, y);
            grid.strokePath();
        }
        root.add(grid);

        // TABLE LEGS
        const legWidth = 20;
        const legHeight = Math.max(100, tableHeight * 0.5);
        const leg1 = this.add.rectangle(
            tableX - tableWidth / 2 + 40,
            tableY + tableHeight / 2 + 20,
            legWidth,
            legHeight,
            0x654321
        );
        const leg2 = this.add.rectangle(
            tableX + tableWidth / 2 - 40,
            tableY + tableHeight / 2 + 20,
            legWidth,
            legHeight,
            0x654321
        );
        root.add([leg1, leg2]);

        // PANEL (relative to table/center)
        const panelWidth = Phaser.Math.Clamp(width * 0.55, 380, 800);
        const panelHeight = Phaser.Math.Clamp(height * 0.45, 260, 550);
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2 - 20;

        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.92);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);
        panel.lineStyle(3, 0xcccccc, 1);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);
        root.add(panel);

        // TITLE
        const title = this.add.text(width / 2, panelY + 35, 'LESTVICA', {
            fontFamily: 'Arial',
            fontSize: `${Math.round(0.045 * height)}px`,
            fontStyle: 'bold',
            color: '#222'
        }).setOrigin(0.5);
        root.add(title);

        // USERS
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userLoged = localStorage.getItem('username');

        // \[TEST\] optional: remove this in production
        const userToUpdate = users.find(u => u.username === 'enej');
        if (userToUpdate) {
            userToUpdate.score = 130;
            localStorage.setItem('users', JSON.stringify(users));
        }

        users.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

        const rowHeight = 35;
        const maxVisibleRows = Math.floor((panelHeight - 140) / rowHeight);
        const visibleUsers = users.slice(0, maxVisibleRows);

        visibleUsers.forEach((user, index) => {
            const y = panelY + 80 + index * rowHeight;
            const rank = index + 1;

            // avatar
            if (user.profilePic) {
                const avatar = this.add.image(panelX + 60, y + 15, user.profilePic)
                    .setDisplaySize(40, 40)
                    .setOrigin(0.5);
                root.add(avatar);
            }

            // rank
            const rankText = this.add.text(panelX + 100, y + 5, `${rank}.`, {
                fontSize: '22px',
                color: '#444'
            });
            root.add(rankText);

            // username
            const style = (user.username === userLoged)
                ? { fontSize: '22px', color: '#0f5cad', fontStyle: 'bold' }
                : { fontSize: '22px', color: '#222' };
            const nameText = this.add.text(panelX + 140, y + 5, user.username, style);
            root.add(nameText);

            // score
            const scoreText = this.add.text(panelX + panelWidth - 80, y + 5, `${user.score ?? 0}`, {
                fontSize: '22px',
                color: '#0044cc'
            }).setOrigin(1, 0);
            root.add(scoreText);
        });

        // BACK BUTTON
        if (this.cameFromMenu === false) {
            const backButton = this.add.text(width / 2, panelY + panelHeight - 40, '↩ Nazaj', {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#0066ff',
                padding: { x: 20, y: 10 }
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => backButton.setStyle({ color: '#0044cc' }))
                .on('pointerout', () => backButton.setStyle({ color: '#0066ff' }))
                .on('pointerdown', () => {
                    this.scene.start('WorkspaceScene');
                });

            root.add(backButton);
        }
    }
}