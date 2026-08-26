const ItemCalculator = {

    materials: {

        weapon: {

            bronze: {
                costMultiplier: 0.5,
                damageModifier: -1
            },

            iron: {
                costMultiplier: 1,
                damageModifier: 0
            },

            steel: {
                costMultiplier: 1.3,
                damageModifier: 1
            }

        },

        armor: {

            bronze: {
                costMultiplier: 0.5,
                damageModifier: -1
            },

            iron: {
                costMultiplier: 1,
                damageModifier: 0
            },

            steel: {
                costMultiplier: 1.3,
                damageModifier: 2
            },

            "dragon scale": {
                costMultiplier: 0.9,
                damageModifier: 6
            },

            "H dragon scale": {
                costMultiplier: 1,
                damageModifier: 10
            }

        }

    },


    statuses: {

        weapon: {

            normal: {
                costMultiplier: 1
            },

            blunt: {
                costMultiplier: 0.75,
                replacesDamage: true,
                damage: "1d4",
                damageType: "bludgeoning"
            },

            rusted: {
                costMultiplier: 0.6,
                damageModifier: -1
            },

            "heavy rusted": {
                costMultiplier: 0.3,
                damageModifier: -3
            },

            sharpened: {
                costMultiplier: 1.05,
                damageModifier: 1
            },

            "perfect edge": {
                costMultiplier: 1.1,
                damageModifier: 2
            }

        },


        armor: {

            normal: {
                costMultiplier: 1
            },

            rusted: {
                costMultiplier: 0.6
            },

            "heavy rusted": {
                costMultiplier: 0.3
            }

        }

    },


    // =========================
    // AVAILABLE STATUSES
    // =========================

    getAvailableStatuses(item) {

        if (!item)
            return [];


        // ARMOR
        if (item.type === "armor") {

            return Object.keys(this.statuses.armor);

        }


        // WEAPON
        if (item.type === "weapon") {

            if (this.isBladeWeapon(item)) {

                return Object.keys(this.statuses.weapon);

            }

            return ["normal"];

        }


        // EVERYTHING ELSE
        return ["normal"];

    },


    // =========================
    // AVAILABLE MATERIALS
    // =========================

    getAvailableMaterials(item) {

        if (!item)
            return [];


        // WEAPON
        if (item.type === "weapon") {

            return Object.keys(this.materials.weapon);

        }


        // METAL ARMOR
        if (
            item.type === "armor" &&
            this.isMetalArmor(item)
        ) {

            return Object.keys(this.materials.armor);

        }


        // NON-METAL ARMOR / OTHER ITEMS
        return ["none"];

    },


    // =========================
    // BLADE
    // =========================

    isBladeWeapon(item) {

    if (!item)
        return false;

    if (item.type !== "weapon")
        return false;

    if (Array.isArray(item.weaponType)) {

        return (
            item.weaponType.includes("blade") ||
            item.weaponType.includes("axe")
        );

    }

    return (
        item.weaponType === "blade" ||
        item.weaponType === "axe"
    );

},


    // =========================
    // METAL ARMOR
    // =========================

    isMetalArmor(item) {

        if (!item)
            return false;


        if (item.type !== "armor")
            return false;


        /*
         * Light armor is non-metal.
         *
         * Hide, leather, padded, studded leather,
         * etc. are therefore not treated as metal.
         */

        return item.category !== "Light";

    },


    // =========================
    // COST
    // =========================

    parseCost(cost) {

        if (typeof cost === "number")
            return cost;


        if (typeof cost !== "string")
            return null;


        const match =
            cost.trim().match(
                /^([\d.]+)\s*(cp|sp|gp)$/i
            );


        if (!match)
            return null;


        const value =
            parseFloat(match[1]);


        const unit =
            match[2].toLowerCase();


        if (unit === "cp")
            return value;


        if (unit === "sp")
            return value * 10;


        if (unit === "gp")
            return value * 100;


        return null;

    },


    formatCost(copper) {

        if (copper === null)
            return null;


        copper =
            Math.round(copper * 100) / 100;


        if (copper >= 100)
            return `${copper / 100} gp`;


        if (copper >= 10)
            return `${copper / 10} sp`;


        return `${copper} cp`;

    },


    // =========================
    // CALCULATE
    // =========================

   calculate(item, modifications = {}) {

    const result =
        structuredClone(item);


    const material =
        modifications.material || "iron";


    const status =
        modifications.status || "normal";


    result.modifications = {

        material,
        status

    };


    let costMultiplier = 1;

    let damageModifier = 0;


    // =====================================================
    // MATERIAL
    // =====================================================

    let materialType = null;


    if (item.type === "weapon") {

        materialType = "weapon";

    }
    else if (
        item.type === "armor" &&
        this.isMetalArmor(item)
    ) {

        materialType = "armor";

    }


    const materialData =
        materialType
            ? this.materials[materialType]?.[material]
            : null;

if (materialData) {

    costMultiplier *=
        materialData.costMultiplier;

    damageModifier +=
        materialData.damageModifier;

}


    // =====================================================
    // STATUS
    // =====================================================

    let statusType = null;


    if (item.type === "weapon") {

        statusType = "weapon";

    }
    else if (item.type === "armor") {

        statusType = "armor";

    }


    const statusData =
        statusType
            ? this.statuses[statusType]?.[status]
            : null;


    if (statusData) {

        costMultiplier *=
            statusData.costMultiplier || 1;


        if (statusData.damageModifier) {

    if (item.type === "armor") {

        if (typeof result.armor === "number") {

            result.armor +=
                statusData.damageModifier;

        }

        else if (typeof result.armorValue === "number") {

            result.armorValue +=
                statusData.damageModifier;

        }

    }
    else {

        damageModifier +=
            statusData.damageModifier;

    }

}


        // Blunt replaces the original weapon damage
        if (statusData.replacesDamage) {

            result.damage =
                statusData.damage;

            result.damageType =
                statusData.damageType;

        }

    }


    // =====================================================
    // DAMAGE MODIFIER
    // =====================================================

   // =========================
// DAMAGE / ARMOR MODIFIER
// =========================

if (item.type === "armor") {

    result.armorValue =
        (result.armorValue ?? 0) +
        damageModifier;

    result.damageModifier =
        damageModifier;

}
else {

    result.damageModifier =
        damageModifier;

}


    /*
     * Build the displayed damage.
     *
     * Example:
     *
     * normal steel sword:
     * 1d8 + 2
     *
     * steel blunt sword:
     * 1d4 + 2
     *
     * iron blunt sword:
     * 1d4
     */

    if (result.damage && damageModifier !== 0) {

        result.displayDamage =
            `${result.damage} ${damageModifier > 0 ? "+" : "-"} ${Math.abs(damageModifier)}`;

    }
    else {

        result.displayDamage =
            result.damage || null;

    }


    // =====================================================
    // COST
    // =====================================================

    const baseCost =
        this.parseCost(item.cost);


    if (baseCost !== null) {

        const finalCost =
            baseCost * costMultiplier;


        result.cost =
            this.formatCost(finalCost);

    }


    // =====================================================
    // DISPLAY NAME
    // =====================================================

    if (
        material !== "iron" ||
        status !== "normal"
    ) {

        const materialName =
            material === "H dragon scale"
                ? "H dragon scale"
                : material
                    .split(" ")
                    .map(word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                    )
                    .join(" ");


        const statusName =
            status === "normal"
                ? ""
                : status
                    .split(" ")
                    .map(word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1)
                    )
                    .join(" ");


        result.name =
            `${materialName} ${result.name}` +
            (
                statusName
                    ? ` (${statusName})`
                    : ""
            );

    }


    return result;

}

};