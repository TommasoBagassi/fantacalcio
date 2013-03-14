(function($) {

    //MODELS AND COLLECTIONS ============================================================
        //GIOCATORE MODEL
        var Giocatore = Backbone.Model.extend({
            defaults: {
                "ID": "",
                "Giocatore": "",
                "Ruolo": "",
                "Squadra": "",
                "duplicazioni": config.lega.duplicazioni_giocatori
            }
        });

        //SQUADRA
        var Rosa = Backbone.Collection.extend({
            model: Giocatore,

            comparator : function(g) {
                return g.get("Giocatore");
            }
        });

        //NOME SQUADRA MODEL
        var Squadra = Backbone.Model.extend({
            squadra: undefined,

            defaults: {
                'nome': 'Squadra',
                'active': false
            },

            initialize: function() {
                this.squadra = new Rosa();
            },

            remove: function() {
                if (this.collection.length <= 1) {
                    this.trigger('alertPlace', 'Non &egrave; possibile rimuovere l\'unica squadra presente');
                } else {
                    this.trigger('replacePlayers');
                    this.collection.remove(this);
                }
            }
        });

        //NOMI SQUADRE COLLECTION
        var Squadre = Backbone.Collection.extend({
            model: Squadra,

            initialize: function() {
                this.on('change:active', this.deactivateAll, this);
            },

            deactivateAll: function(model) {
                for (var i=0, l=this.length; i<l; i++) {
                    var g = this.models[i];
                    if (g != model) {
                        if (g.get('active') == true) g.set({ 'active': false }, { silent: true });
                    }
                }
            }
        });
    //===================================================================================

    //VIEWS =============================================================================
        //VIEW TAB CONFIGURAZIONE (View of Model Squadra)
        var TabSquadra = Backbone.View.extend({
            templateId : '#tab-squadra',
            mainViewContainerId: '#view-squadra',
            view: undefined,
            nomeDisplayId: 'a.nomeSquadra',
            tab: undefined,

            events: {
                'click a.nomeSquadra': 'activateMe'
            },

            initialize: function() {
                this.model.on("change:nome", this.changeNome, this);
                this.model.on("change:active", this.checkActivation, this);
                this.model.on('alertPlace', this.alertPlace, this);
                this.model.on('replacePlayers', this.replacePlayers, this);
                this.model.on('remove', this.removeTab, this);
                this.container = this.options.container;
                this.addMainView();
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template({ nomeSquadra: this.model.get('nome') })));
                if (this.model.get('active') ==  true) this.firstActivation();
                return this;
            },

            addMainView: function() {
                this.view = new MainView({ collection: this.model.squadra, squadra: this.model });
                this.attach($(this.mainViewContainerId), this.view);
            },

            changeNome: function(model) {
                this.$('a.nomeSquadra').html(model.get('nome'));
            },

            activateMe: function() {
                this.model.set({ 'active': true });
            },

            deactivateMe: function() {
                this.model.set({ 'active': false });
            },

            checkActivation: function(model) {
                var active = model.get('active');
                if (active == true) this.clickMe();
            },

            clickMe: function() {
                this.$('a.nomeSquadra').click();
            },

            firstActivation: function() {
                this.$el.addClass('active');
                this.view.firstActivation();
            },

            attach: function(container, view) {
                container.append(view.$el);
            },

            removeTab: function(model) {
                this.view.removeSubs();
                this.view.remove();
            },

            alertPlace: function(msg) {
                this.view.alertPlace(msg);
            },

            replacePlayers: function() {
                this.view.replacePlayers();
            }
        });

        //VIEW PAGINA CONFIGURAZIONE (View of Collection Rosa - referenced by Model Squadra)
        var MainView = Backbone.View.extend({
            templateId : '#tab-squadra-contenuto',
            portieri: undefined,
            portieriTableId: '.rosa-giocatori .portieri',
            difensori: undefined,
            difensoriTableId: '.rosa-giocatori .difensori',
            centrocampisti: undefined,
            centrocampistiTableId: '.rosa-giocatori .centrocampisti',
            attaccanti: undefined,
            attaccantiTableId: '.rosa-giocatori .attaccanti',
            inputField: undefined,
            alertId: '#alert',
            alert: undefined,
            alertContainer: '.nome-squadra .alert-container',

            events: {
                'submit form': 'preventForm',
                'click a.salvaSquadra': 'saveTeam',
                'click a.rimuoviSquadra': 'removeTeam'
            },

            initialize: function() {
                this.squadra = this.options.squadra;
                this.squadra.on('change:active', this.resetTables, this);
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template({ nomeSquadra: this.squadra.get('nome') })));
                this.addTables();
                this.setInput();
                return this;
            },

            firstActivation: function() {
                this.$el.addClass('active');
            },

            addTables: function() {
                if (this.portieri == undefined) {
                    this.portieri = new TabellaGiocatori({ calciatori: App.calciatori, collection: this.collection, ruolo: 'Portieri', squadra: this.squadra, maxGiocatori: config.formazione.portieri });
                } else {
                    this.portieri.render();
                }
                if (this.difensori == undefined) {
                    this.difensori = new TabellaGiocatori({ calciatori: App.calciatori, collection: this.collection, ruolo: 'Difensori', squadra: this.squadra, maxGiocatori: config.formazione.difensori });
                } else {
                    this.difensori.render();
                }
                if (this.centrocampisti == undefined) {
                    this.centrocampisti = new TabellaGiocatori({ calciatori: App.calciatori, collection: this.collection, ruolo: 'Centrocampisti', squadra: this.squadra, maxGiocatori: config.formazione.centrocampisti });
                } else {
                    this.centrocampisti.render();
                }
                if (this.attaccanti == undefined) {
                    this.attaccanti = new TabellaGiocatori({ calciatori: App.calciatori, collection: this.collection, ruolo: 'Attaccanti', squadra: this.squadra, maxGiocatori: config.formazione.attaccanti });
                } else {
                    this.attaccanti.render();
                }
                this.attach(this.$(this.portieriTableId), this.portieri);
                this.attach(this.$(this.difensoriTableId), this.difensori);
                this.attach(this.$(this.centrocampistiTableId), this.centrocampisti);
                this.attach(this.$(this.attaccantiTableId), this.attaccanti);
            },

            resetTables: function() {
                this.portieri.resetTables();
                this.difensori.resetTables();
                this.centrocampisti.resetTables();
                this.attaccanti.resetTables();
            },

            setInput: function() {
                if (this.inputField == undefined) {
                    this.inputField = new InputName({ el: this.$('input.nomeSquadra'), model: this.squadra });
                }
            },

            preventForm: function(e) {
                e.preventDefault();
            },

            saveTeam: function(e) {
                e.preventDefault();
                this.emptyAlert();
                //SAVING ACTIONS
            },

            removeTeam: function(e) {
                e.preventDefault();
                this.emptyAlert();
                this.squadra.remove();
            },

            replacePlayers: function() {
                var models = this.collection.models;
                this.collection.remove(models);
                App.calciatori.add(models);
            },

            attach: function(container, view) {
                container.append(view.$el);
            },

            removeSubs: function() {
                this.portieri.remove();
                this.difensori.remove();
                this.centrocampisti.remove();
                this.attaccanti.remove();
                this.inputField.remove();
            },

            alertPlace: function(msg) {
                this.alert = _.template($(this.alertId).html(), { message: msg });
                this.$(this.alertContainer).html(this.alert);
                this.$(this.alertContainer).find('.alert').fadeOut(6000);
            },

            emptyAlert: function() {
                this.$(this.alertContainer).empty();
                this.$(this.alertContainer).show();
            }
        });

        //VIEW INPUT CHANGE NAME (View of Model Squadra - referenced by MainView)
        var InputName = Backbone.View.extend({

            events: {
                'change': 'cambiaNome'
            },

            cambiaNome: function(e) {
                e.preventDefault();
                this.model.set({ nome: $(this.el).val() });
            }

        });

        //VIEW TABELLE RUOLI (View of Collection Rosa - referenced by Squadra - uses App.calciatori)
        var TabellaGiocatori = Backbone.View.extend({
            templateId : '#tab-squadra-contenuto-tabella',
            selectId: 'select.elenco',
            select: undefined,
            tableId: 'table.tabella-calciatori tbody',
            table: undefined,
            giocatori: 0,
            currentModel: undefined,
            alertId: '#alert',
            alertContainer: '.alert-container',


            events: {
                'click a.aggiungi-giocatore': 'addGiocatore',
                'change select.elenco': 'setCurrentModel'
            },

            initialize: function() {
                this.ruolo = this.options.ruolo;
                this.squadra = this.options.squadra;
                this.calciatori = this.options.calciatori;
                this.maxGiocatori = this.options.maxGiocatori;
                this.giocatori = this.filterList(this.collection).length;
                this.collection.on("add", this.addToTable, this);
                this.collection.on("remove", this.removeFromTable, this);
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                this.setElement($(this.template({ ruolo: this.ruolo })));
                this.select = this.$(this.selectId);
                this.table = this.$(this.tableId);
                this.setFields();
                this.setNum(this.giocatori);
                return this;
            },

            setFields: function() {
                this.setSelect();
            },

            setSelect: function() {
                this.select.select2("destroy");
                this.select.empty();
                var list = this.filterList(this.calciatori);
                _(list).each(function(g) { 
                    var opt = new SelectOption({ model: g });
                    this.attach(this.select, opt);
                }, this);
                this.select.select2({
                    containerCss: {
                        'width': '75%',
                        'padding': '0 0 10px'
                    }
                });
                this.setCurrentModel();
            },

            setNum: function() {
                var tgt = this.$('small.num');
                tgt.html(this.giocatori+' di '+this.maxGiocatori);
            },

            setCurrentModel: function() {
                var opt = $(this.select.find('option:selected')).data('view');
                this.currentModel = opt.model;
            },

            addGiocatore: function() {
                this.giocatori = this.filterList(this.collection).length;
                if (this.giocatori < this.maxGiocatori) {
                    this.calciatori.remove(this.currentModel);
                    this.collection.add(this.currentModel);
                } else {
                    this.displayAlert('Hai raggiunto il numero massimo di giocatori per questo ruolo.');
                }
            },

            removeGiocatore: function(model) {
                this.calciatori.add(model);
                this.collection.remove(model);
            },

            displayAlert: function(msg) {
                this.alert = _.template($(this.alertId).html(), { message: msg });
                this.$(this.alertContainer).html(this.alert);
                this.$(this.alertContainer).find('.alert').fadeOut(6000);
            },

            emptyAlert: function() {
                this.$(this.alertContainer).empty();
                this.$(this.alertContainer).show();
            },

            resetTables: function() {
                this.setFields();
                this.setNum();
            },

            addToTable: function(model) {
                this.giocatori = this.filterList(this.collection).length;
                var tr = new PlayerTableRow({ model: model });
                if (model.get('Ruolo') == this.ruolo) {
                    this.attach(this.table, tr);
                    this.resetTables();
                }
            },

            removeFromTable: function(model) {
                this.removeGiocatore(model);
                this.giocatori = this.filterList(this.collection).length;
                this.resetTables();
            },

            attach: function(container, view) {
                container.append(view.$el);
            },

            filterList: function(collection) {
                return collection.where({ Ruolo: this.ruolo });
            }
        });

        //VIEW SELECT OPTION (View of Model Giocatore - used by Rosa and App.calciatori)
        var SelectOption = Backbone.View.extend({
            templateId: '#tab-squadra-contenuto-option',

            initialize: function() {
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                var theString = this.model.get('Giocatore')+' ('+this.model.get('Squadra')+') '+this.model.get('ID');
                this.setElement($(this.template({ theString: theString })));
                this.$el.data({ 'view': this });
                return this;
            }
        });

        //VIEW TABLE PLAYER (View of Model Giocatore - used by Rosa and App.calciatori)
        var PlayerTableRow = Backbone.View.extend({
            templateId: '#rosa-riga-calciatore',

            events: {
                'click a.rimuovi-giocatore': 'rimuoviGiocatore'
            },

            initialize: function() {
                this.template = _.template($(this.templateId).html());
                this.render();
            },

            render: function() {
                var id = this.model.get('ID'),
                    name = this.model.get('Giocatore'),
                    team = this.model.get('Squadra');
                this.setElement($(this.template({ id: id, name: name, team: team })));
                return this;
            },

            rimuoviGiocatore: function() {
                this.model.collection.remove(this.model);
                this.$el.remove();
            }
        });
    //===================================================================================

    //MAIN APP===========================================================================
        //MAIN VIEW CONTROLLER
        var App = new (Backbone.View.extend({
            tabContainerId: '#tab-squadre',
            currentView: undefined,
            uniqueId: 1,
            createdViews: {},
            maxTeams: 16,
            //GIOCATORI COLLECTION DI GIOCATORE (SINGLETON)
            calciatori: new (Backbone.Collection.extend({
                model: Giocatore,
                url: 'inc/lista_giocatori.js',

                comparator : function(g) {
                    return g.get("Giocatore");
                }
            }))(elencoCalciatori),

            events: {
                'click #aggiungiSquadra': 'addTeam'
            },

            initialize: function() {
                this.collection.on("add", this.addTab, this);
                this.collection.on("remove", this.removeTab, this);
            },

            render: function() {
                if (this.collection.length == 0) this.addSquadraToCollection();
            },

            addTeam: function(e) {
                e.preventDefault();
                if (this.collection.length < this.maxTeams) this.addSquadraToCollection();
            },

            addSquadraToCollection: function() {
                this.collection.add({ nome: 'Squadra '+this.uniqueId, id: 'Squadra_'+this.uniqueId });
            },

            addTab: function(squadra) {
                if (this.currentView == undefined) squadra.set({ 'active': true });

                this.createdViews[squadra.id] = new TabSquadra({ model: squadra });

                if (this.currentView == undefined) {
                    this.setCurrentView(this.createdViews[squadra.id]);
                }

                this.uniqueId += 1;

                this.attach($(this.tabContainerId), this.createdViews[squadra.id]);
            },

            removeTab: function(model) {
                this.createdViews[model.id].remove();
                delete this.createdViews[model.id];

                this.activateFirstTab();
            },

            activateFirstTab: function() {
                var model = this.collection.at(0);
                model.set({ 'active': true });
            },

            setCurrentView: function(view) {
                this.currentView = view;
            },

            attach: function(container, view) {
                container.append(view.$el);
            }
        }))({ el: '#configuratoreSquadra', collection: new Squadre() });


    $(document).ready(function() {

        App.render();

    });

})(jQuery);