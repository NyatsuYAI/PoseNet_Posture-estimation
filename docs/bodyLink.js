class BodyLink {

    constructor(l_id, name, mass) {
        this.l_id = l_id; //linkのID
        this.name = name; //linkの名前
        this.mass = mass; // linkの質量分配比
        this.child_val = null; //子供の変数
        this.sister_val = null; // 兄弟姉妹の変数

    }

    set_child_sister(child_val, sister_val) {
        this.child_val = child_val;
        this.sister_val = sister_val;
    }

    Resultant_Mass(bw, sister = 0) {
        if (this.l_id == 0) {
            return 0.0;
        } else if (sister == 0) {//部分（そこから遠位のみの）解析
            return bw * this.mass + (this.child_val).Resultant_Mass(bw, sister);
        } else {
            return (bw * this.mass + (this.child_val).Resultant_Mass(bw, sister) + (this.sister_val).Resultant_Mass(bw, sister))
        }
    }

    searchChildren(searchResult, searchName) {
        if (this.name === searchName) searchResult.push(this);
        this.childrenArray.forEach(child => child.searchChildren(searchResult, searchName));
    }

}

const b_link = {}; //配列の初期化
b_link[0] = new BodyLink(0, '', .0);//0のときストップ
b_link[1] = new BodyLink(1, 'Hip', .187);
b_link[2] = new BodyLink(2, 'Chest', .302);
b_link[3] = new BodyLink(3, 'Head', .069);
b_link[4] = new BodyLink(4, 'RUArm', .027);
b_link[5] = new BodyLink(5, 'RFArm', .016);
b_link[6] = new BodyLink(6, 'RHand', .006);
b_link[7] = new BodyLink(7, 'LUArm', .027);
b_link[8] = new BodyLink(8, 'LFArm', .016);
b_link[9] = new BodyLink(9, 'LHand', .006);
b_link[10] = new BodyLink(10, 'RThigh', .110);
b_link[11] = new BodyLink(11, 'RShin', .051);
b_link[12] = new BodyLink(12, 'RFoot', .011);
b_link[13] = new BodyLink(13, 'LThigh', .110);
b_link[14] = new BodyLink(14, 'LShin', .051);
b_link[15] = new BodyLink(15, 'LFoot', .011);


//親子関係と兄弟姉妹関係を下記でb_linkのchild_val, sister_valに追記
b_link[1].set_child_sister(b_link[2], b_link[0]);
b_link[2].set_child_sister(b_link[3], b_link[10]);
b_link[3].set_child_sister(b_link[0], b_link[4]);
b_link[4].set_child_sister(b_link[5], b_link[7]);
b_link[5].set_child_sister(b_link[6], b_link[0]);
b_link[6].set_child_sister(b_link[0], b_link[0]);
b_link[7].set_child_sister(b_link[8], b_link[0]);
b_link[8].set_child_sister(b_link[9], b_link[0]);
b_link[9].set_child_sister(b_link[0], b_link[0]);
b_link[10].set_child_sister(b_link[11], b_link[13]);
b_link[11].set_child_sister(b_link[12], b_link[0]);
b_link[12].set_child_sister(b_link[0], b_link[0]);
b_link[13].set_child_sister(b_link[14], b_link[0]);
b_link[14].set_child_sister(b_link[15], b_link[0]);
b_link[15].set_child_sister(b_link[0], b_link[0]);

console.log(b_link[4])