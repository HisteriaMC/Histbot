module.exports.xpmanager =
    class XPManager{
        //xp constructor : {userid: {id: 0, xp: O, lvl: 0}}
        xp = {};
        constructor(client) {
            this.client = client;
            this.initializeDB();
        }

        initializeDB() {
            this.client.mysql.query('SELECT * FROM `xp`;',(err, results) => {
                if(!results) return console.error("Impossible de trouver l'xp " + err);
                results.forEach(result => {
                    this.setFull(result.id, {id: result.id, xp: result.xp, lvl: result.lvl}, false)
                });
            });
        }

        getFull(id) {
            return this.xp[id];
        }
        setFull(id, full, changed = true) {
            this.xp[id] = full;
            this.xp[id].changed = changed;
        }

        getXP(id) {
            if(!this.xp[id]) return 0;
            return this.xp[id].xp;
        }
        addXP(id, xp) {
            if(!this.xp[id]) this.notRegistered(id);

            this.xp[id].changed = true;
            this.xp[id].xp += xp;
        }

        getLvl(id) {
            if(!this.xp[id]) return 0;
            return this.xp[id].lvl;
        }
        addLvl(id, lvl) {
            if(!this.xp[id]) this.notRegistered(id);
            this.xp[id].changed = true;
            this.xp[id].lvl += lvl;
        }
        notRegistered(id) {
            this.xp[id] = {id: id, xp: 0, lvl: 1, changed: true};
        }

        async getRank(id) {
            let top = await this.getTop(this.xp.length);
            for (const [key, user] of Object.entries(top)) {
                if(user.id === id) return key;
            }
            return "Introuvable";
        }

        async getTop(max) {
            let xp = this.xp, top = {}, full;
            let keysSorted = Object.keys(xp).sort(function(a,b){return xp[b].xp - xp[a].xp}).slice(0, max);
            keysSorted.forEach((key, index) => {
                full = this.getFull(key);
                top[index+1] = full;
            });
            return top;
        }

        async save() {
            for (const user of Object.values(this.xp)) {
                if (!user.changed) continue;
                let xp = user.xp, lvl = user.lvl, id = user.id;
                await this.client.mysql.execute("INSERT INTO `xp` VALUES ('" + id + "', '" + xp + "', '" + lvl + "') " +
                    "ON DUPLICATE KEY UPDATE xp = '" + xp + "', lvl = '" + lvl + "';");
            }
            //await require("sleep.js")(10);
        }
    }