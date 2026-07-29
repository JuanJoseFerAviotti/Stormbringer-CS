const TalentEffects = {

    has(id){
        return getTalentRank(id) > 0;
    },

    rank(id){
        return getTalentRank(id);
    }

};