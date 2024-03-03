export default class InputClass {
    constructor ({mapDataClass: mapDataClass, graphicsClass: graphicsClass, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check}) {
        this.mapDataClass = mapDataClass
        this.graphicsClass = graphicsClass
        //--------------------------------------------------------------------
        this.MOVE_SPEED = 20
        this.MOVE_ANGLE = 0.5
        this.WALL_DISTANCE = (graphicsClass.CELL_SIZE / 100) * 40
        //--------------------------------------------------------------------
        this.menu = menu
        this.gameMenu = gameMenu
        this.player = player
        this.keyPressed = keyPressed
        this.keybordListener = null
        this.gamePlay = gamePlay
        this.check = check

        this.loadInputs()
        this.moveMenuStar()
    }
    
    menuGameJumpAction() {
        this.menu.menuactive = !this.menu.menuactive;
        if (this.menu.menuactive) {
            // MENU
            if (this.keybordListener) {
                cancelAnimationFrame(this.keybordListener);
                this.keybordListener = null;
            }
        } else {
            // GAME
            if (this.keybordListener == null || typeof this.keybordListener == 'undefined') this.handleKeyPress();
        }
        // REFRESH MENU
        this.graphicsClass.makeMenu()

        this.gameMenu()
    }

    moveMenuStar(way = 0) {
        let menuRowsAll = $('#menu-box').find('.menu-element')
        let menuRowsAllLength = $('#menu-box').find('.menu-element').length
        menuRowsAll.find('img').hide()
        this.menu.actualMenuRow = this.menu.actualMenuRow + way
        if (this.menu.actualMenuRow < 0) this.menu.actualMenuRow = menuRowsAllLength-1;
        else if (this.menu.actualMenuRow > menuRowsAllLength-1) this.menu.actualMenuRow = 0;
        menuRowsAll.eq(this.menu.actualMenuRow).find('img').show()
    }

    changeMenuStar(elementId, modifyActualMenuRow) {
        let menuRowsAll = $('#menu-box').find('.menu-element')
        menuRowsAll.find('img').hide()
        var menuIndex = $('#menu-box').find(`.menu-element[id=${elementId}]`).index();
        if (modifyActualMenuRow) {
            this.menu.actualMenuRow = menuIndex;
        }
        menuRowsAll.eq(menuIndex).find('img').show()
    }

    // ENTER
    getActualMenuStar() {
        let elementId = $('#menu-box .menu-element').filter(function() {
            return $(this).find('img').is(':visible');
        }).first().attr('id');
        return elementId;
    }

    changeOptionRow(elementId) {
        var selectedOption = $(`#${elementId}`).val()
        if (selectedOption == 0) {
            $(`#${elementId}`).val(1)
        } else if (selectedOption == 1) {
             $(`#${elementId}`).val(0)
        }
         $(`#${elementId}`).trigger('change')
    }

    menuAction(menuId) {
        var menuId = menuId
        setTimeout(() => {
            if (menuId == 'menu-new' || menuId == 'menu-resume') this.menuGameJumpAction();

            if (menuId == 'menu-options') {
                this.menu.optionsActive = true;
                this.menu.actualMenuRow = 0
                this.graphicsClass.makeMenu()
                this.add_optionsEventListeners()
                this.moveMenuStar(0)
            }

            if (menuId == 'menu-options-back') {
                this.menu.optionsActive = false;
                this.menu.actualMenuRow = 0
                this.remove_optionsEventListeners()
                this.graphicsClass.makeMenu()
                this.moveMenuStar(0)
            }

            if (menuId == 'menu-end') {
                console.log('End Game!');
                $("#graphics-container").html('')
                this.texturesClass = null
                clearInterval(this.gamePlay.game)
                this.gamePlay.gameLoaded = false
                this.gamePlay.game = null
                this.menu.menuactive = true
                this.menu.actualMenuRow = 0
                this.graphicsClass.makeMenu()
                this.moveMenuStar(0)
            }

            if (menuId == 'menu-infopanel') { 
                this.changeMenuStar('menu-infopanel', true)
                this.changeOptionRow('infopanel-select')
            };
            
            if (menuId == 'menu-minimap') { 
                this.changeMenuStar('menu-minimap', true)
                this.changeOptionRow('minimap-select')
            }

        }, 10)  // Ha lesz hang akkor kell majd beállítani
        return;
    }

    loadInputs() {
        //////////
        // KEYDOWN
        //////////
        document.addEventListener('keydown', (event) => {
            // TOGETHER
            if (event.key == ' ') {
                console.log('Space');
                if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX]) {

                    // type
                    console.log(this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].type);
                    // OPEN DOOR
                    if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].type == 'door') {
                        this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].anim_switch = true
                    }
                }
            }
            
            if(event.key == 'Escape') {
                // MENU PUSH ESC
                if (this.menu.optionsActive) {
                    this.menu.optionsActive = false;
                    this.graphicsClass.makeMenu()
                    return;
                }

                // GAME PUSH ESC
                if (!this.menu.menuactive) {
                    this.menu.menuactive = false
                    this.menuGameJumpAction();
                    return;
                }

                this.graphicsClass.makeMenu()
                this.moveMenuStar(0)
                return;
            }
            // MENU
            if (this.menu.menuactive) {
                // Enter
                if (event.key == 'Enter') { 
                    let elementId = this.getActualMenuStar()
                    this.menuAction(elementId)
                }

                if (event.key == 'w' || event.key === 'ArrowUp' || event.key === 'Up') this.moveMenuStar(-1);
                if (event.key == 's' || event.key === 'ArrowDown' || event.key === 'Down') this.moveMenuStar(1);
                
            } else {
            // GAME
                this.keyPressed[event.key] = true
                if (event.key == '1') this.menu.skySwitch = !this.menu.skySwitch;
                if (event.key == '2') this.menu.floorSwitch = !this.menu.floorSwitch;
                if (event.key == 'm') this.menu.mapSwitch = !this.menu.mapSwitch;
                if (event.key == 'i') this.menu.infoSwitch = !this.menu.infoSwitch;
                if (event.key == 'g') this.menu.shadowsSwitch = !this.menu.shadowsSwitch;
                if (event.key == 'h') this.menu.spriteShadowsSwitch = !this.menu.spriteShadowsSwitch;
            }
        });

        ////////////////////////////////
        // SPEED KEYS - Animation frames
        ////////////////////////////////
        if (!this.menu.menuactive) {
            // GAME
            console.log(this.keyPressed);
            this.keyPressed[event.key] = true
            if (event.key == 'm') this.menu.mapSwitch = !this.menu.mapSwitch;
            if (event.key == 'i') this.menu.infoSwitch = !this.menu.infoSwitch;
            if (event.key == 'g') this.menu.shadowsSwitch = !this.menu.shadowsSwitch;
            if (event.key == 'h') this.menu.spriteShadowsSwitch = !this.menu.spriteShadowsSwitch;
        }

        ////////
        // KEYUP
        ////////
        document.addEventListener('keyup', (event) => {
            // MENU
            if (this.menu.menuactive) {
                if(event.key == 'i') { console.log('MENU I megnyomva!! KEYUP') }
                // GAME
            } else {
                this.keyPressed[event.key] = false
                this.player.speed = 0;
            }
        });
        
        ////////
        // MOUSE
        ////////
        document.addEventListener('click', function(event) {
            let element = event.target;
            while (element) {
                if (element.id) {
                    this.menuAction(element.id)
                    this.moveMenuStar(0)
                }
                element = element.parentElement;
            }
        }.bind(this));

        document.addEventListener('mouseover', function(event) {
            let element = event.target;
            while (element) {
                if (element.id) {
                    //console.log('Az element ID-je:', element.id)
                    this.changeMenuStar(element.id, false)
                    if (element.id == 'menu-bg' || element.id == 'menu-box') this.moveMenuStar(0);
                    return;
                }
                element = element.parentElement;
            }
        }.bind(this));
    }

    handleKeyPress = () => {
        if (this.keyPressed['a']) { this.player.angle += -this.graphicsClass.toRadians(5); }
        if (this.keyPressed['d']) { this.player.angle += this.graphicsClass.toRadians(5); }
        if (this.keyPressed['q']) { this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE); }
        if (this.keyPressed['e']) { this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE); }
        if (this.keyPressed['w']) { this.player.speed = this.MOVE_SPEED }
        if (this.keyPressed['s']) { this.player.speed = -this.MOVE_SPEED }

        this.keybordListener = requestAnimationFrame(this.handleKeyPress);
    }

    add_optionsEventListeners() {
        // ADD OPTIONS
        var clone = this
        $('#infopanel-select').on('change', function(event) {
            event.preventDefault();
            var selectedValue = $(this).val();
            if (selectedValue == '0') {
                clone.menu.infoSwitch = false;
            } else if (selectedValue == '1') {
                clone.menu.infoSwitch = true;
            }
            $(this).blur();
            console.log(clone.menu.infoSwitch)
        });

        $('#minimap-select').on('change', function(event) {
            event.preventDefault();
            var selectedValue = $(this).val();
            if (selectedValue == '0') {
                clone.menu.mapSwitch = false;
            } else if (selectedValue == '1') {
                clone.menu.mapSwitch = true;
            }
            $(this).blur();
            console.log(clone.menu.mapSwitch)
        });
    }

    remove_optionsEventListeners() {
        // REMOVE OPTIONS
        $('#infopanel-select').off('change')
        $('#minimap-select').off('change')
    }
}