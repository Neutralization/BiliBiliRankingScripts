MasterComposition = app.project.items.addComp("bilibilirank", 1280, 720, 1, 1800, 30);

// image resource
PublicImageDict = {
    "0_blank_1": ".\\public\\blank.png",
    "0_blank_2": ".\\public\\bg_2.png",
    "0_blank_3": ".\\public\\bg_3.png",
    "0_change": ".\\public\\change.png",
    "01_bgm": ".\\public\\bgm.png",
    "01_op": ".\\ranking\\1_op\\op_2.png",
    "01_rule_1": ".\\ranking\\pic\\rule_1.png",
    "01_rule_2": ".\\ranking\\pic\\rule_2.png",
    "01_rule_3": ".\\ranking\\pic\\rule_3.png",
    "01_rule_4": ".\\ranking\\pic\\rule_4.png",
    "01_start": ".\\ranking\\1_op\\start.png",
    "01_title": ".\\ranking\\1_op\\title.png",
    "01_warn_1": ".\\public\\warn_1.png",
    "01_warn_2": ".\\public\\warn_2.png",
    "01_world": ".\\ranking\\1_op\\world.png",
    "02_next": ".\\ranking\\pic\\_pickup.png",
    "04_next": ".\\ranking\\pic\\_1.png",
    "06_bgm_004": ".\\ranking\\list4\\bangumi_004.png",
    "06_bgm_005": ".\\ranking\\list4\\bangumi_005.png",
    "06_cn_main": ".\\ranking\\pic\\guochuang_zhu.png",
    "06_cn_sub": ".\\ranking\\pic\\guochuang_fu.png",
    "06_film": ".\\ranking\\pic\\film.png",
    "06_tv_001": ".\\ranking\\list3\\tv_001.png",
    "06_tv_002": ".\\ranking\\list3\\tv_002.png",
    "06_tv_003": ".\\ranking\\list3\\tv_003.png",
    "08_next": ".\\ranking\\pic\\_3.png",
    "10_bangumi": ".\\ranking\\pic\\bangumi.png",
    "10_bgm_001": ".\\ranking\\list4\\bangumi_001.png",
    "10_bgm_002": ".\\ranking\\list4\\bangumi_002.png",
    "10_bgm_003": ".\\ranking\\list4\\bangumi_003.png",
    "10_bgm_main": ".\\ranking\\pic\\bangumitop10.png",
    "12_next": ".\\ranking\\pic\\_4.png",
    "14_history": ".\\ranking\\pic\\history.png",
    "14_record": ".\\ranking\\pic\\history_record.png",
    "16_logo": ".\\public\\logo.png",
    "17_over": ".\\ranking\\pic\\over.png",
    "17_stat_1": ".\\ranking\\pic\\stat_1.png",
    "17_stat_2": ".\\ranking\\pic\\stat_2.png",
    "17_stat_3": ".\\ranking\\pic\\stat_3.png",
    "18_addr": ".\\ranking\\2_ed\\addr2.png",
    "18_ed": ".\\ranking\\2_ed\\ed.png",
    "18_next": ".\\ranking\\pic\\_5.png",
    "18_staff": ".\\ranking\\2_ed\\staff.png",
    1: ".\\ranking\\list2\\001.png",
    2: ".\\ranking\\list2\\002.png",
    3: ".\\ranking\\list2\\003.png",
    4: ".\\ranking\\list2\\004.png",
    5: ".\\ranking\\list2\\005.png",
    6: ".\\ranking\\list2\\006.png",
    7: ".\\ranking\\list2\\007.png",
    8: ".\\ranking\\list2\\008.png",
    9: ".\\ranking\\list2\\009.png",
    10: ".\\ranking\\list2\\010.png",
    11: ".\\ranking\\list2\\011.png",
    12: ".\\ranking\\list2\\012.png",
    13: ".\\ranking\\list2\\013.png",
    14: ".\\ranking\\list2\\014.png",
    15: ".\\ranking\\list2\\015.png",
    16: ".\\ranking\\list2\\016.png",
    17: ".\\ranking\\list2\\017.png",
    18: ".\\ranking\\list2\\018.png",
    19: ".\\ranking\\list2\\019.png",
    20: ".\\ranking\\list2\\020.png",
    21: ".\\ranking\\list2\\021.png",
    22: ".\\ranking\\list2\\022.png",
    23: ".\\ranking\\list2\\023.png",
    24: ".\\ranking\\list2\\024.png",
    25: ".\\ranking\\list2\\025.png",
    26: ".\\ranking\\list2\\026.png",
    27: ".\\ranking\\list2\\027.png",
    28: ".\\ranking\\list2\\028.png",
    29: ".\\ranking\\list2\\029.png",
    30: ".\\ranking\\list2\\030.png",
};

// audio resource
PublicAudioDict = {
    "0_change": ".\\public\\av2313.mp3",
    "0_next": ".\\public\\bilibili-mubox.wav",
    "01_audio": ".\\public\\Summer.mp3",
    "02_audio": ".\\public\\a-3s-new.wav",
    "06_audio": ".\\ranking\\list4\\04.MIRACLE RUSH (inst.).mp3",
    "10_audio": ".\\public\\05 Zzz (Instrumental).mp3",
    "14_audio": ".\\public\\1.mp3",
    "17_audio": ".\\public\\bilibili.mp3",
    "18_audio": ".\\ranking\\2_ed\\ed.mp3",
};
LostFile = ".\\tv_x264.mp4";

NormalRankSize = [960, 540];
DirectoryPrefix = ".\\ranking\\list1\\";
LostVideos = [""];
// @include "json2.js"
regex = /- :rank: (\d+)\n  :name: (\w+)\n  :length: (\d+)\n  :offset: (\d+)(\n  :short: \d+)?(\n  :no_pause: true)?/gm;
subst = '$1: ["$2", $3, $4],';
parts = [3, 5, 7, 9, 11, 13, 15, 16];
RankDataList = [];
YUME = 1277009809;
weeks = Math.floor((Date.now() / 1000 - YUME) / 3600 / 24 / 7);
alert(weeks)
for (n = 0; n < parts.length; n++) {
    file = new File(DirectoryPrefix + weeks + "_" + parts[n] + ".yml");
    file.open("r");
    ymlstring = file.read();
    file.close();
    RankList = ymlstring.replace(regex, subst).replace("'", '"').replace("---", "{") + "}";
    alert(RankList);
    RankDataList[RankDataList.length] = JSON.parse(RankList);
}

PickupData = RankDataList[0];
RankData_5 = RankDataList[1];
RankData_7 = RankDataList[2];
RankData_9 = RankDataList[3];
RankData_11 = RankDataList[4];
RankData_13 = RankDataList[5];
RankData_15 = RankDataList[6];
RankData_16 = RankDataList[7];

// function
function AddLayer(target, filename, duration, s_time) {
    NewLayer = target.layers.add(
        app.project.importFile(new ImportOptions(File(filename))),
        duration
    );
    NewLayer.startTime = s_time;
    return NewLayer;
}

function AddAudioProperty(target, f_type, s_time, duration, direction) {
    NewProperty = target.property("Audio Levels");
    if (f_type == 1) {
        // circle
        if (direction == 1) {
            // fade in
            for (t = s_time; t <= s_time + duration; t += 0.01) {
                NewProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow(1 - (t - s_time) / duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow(1 - (t - s_time) / duration, 2)) - 1) * 50,
                ]);
            }
            NewProperty.setValueAtTime(s_time, [-100, -100]);
        }
        if (direction == 2) {
            // fade out
            for (t = s_time; t <= s_time + duration; t += 0.01) {
                NewProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow((t - s_time) / duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow((t - s_time) / duration, 2)) - 1) * 50,
                ]);
            }
            NewProperty.setValueAtTime(s_time + duration, [-100, -100]);
        }
    }
    if (f_type == 2) {
        // sin
        if (direction == 1) {
            // fade in
            for (t = s_time; t <= s_time + duration; t += 0.01) {
                NewProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - s_time)) / duration) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - s_time)) / duration) + 1) / 2) * -50,
                ]);
            }
            NewProperty.setValueAtTime(s_time, [-100, -100]);
        }
        if (direction == 2) {
            // fade out
            for (t = s_time; t <= s_time + duration; t += 0.01) {
                NewProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - s_time)) / duration + Math.PI) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - s_time)) / duration + Math.PI) + 1) / 2) * -50,
                ]);
            }
            NewProperty.setValueAtTime(s_time + duration, [-100, -100]);
        }
    }
    return NewProperty;
}

function AddVideoProperty(target, f_type, s_time, duration, direction) {
    if (f_type == 1) {
        // Opacity
        NewProperty = target.property("Opacity");
        if (direction == 1) {
            // fade in
            for (t = s_time; t <= s_time + duration; t += 0.01) {
                NewProperty.setValueAtTime(
                    t,
                    ((Math.cos((Math.PI * (t - s_time)) / duration + Math.PI) + 1) / 2) * 100
                );
            }
            NewProperty.setValueAtTime(s_time + duration, 100);
        }
        if (direction == 2) {
            // fade out
            for (t = s_time; t <= s_time + duration; t += 0.01) {
                NewProperty.setValueAtTime(
                    t,
                    ((Math.cos((Math.PI * (t - s_time)) / duration) + 1) / 2) * 100
                );
            }
            NewProperty.setValueAtTime(s_time + duration, 0);
        }
    }
    if (f_type == 2) {
        NewProperty = target.property("Effects").addProperty("ADBE Linear Wipe");
        if (direction == 1) {
            // fade in
            // Transition Completion
            NewProperty.property(1).setValueAtTime(s_time, 100);
            NewProperty.property(1).setValueAtTime(s_time + duration, 0);
            // Transition Angle
            NewProperty.property(2).setValueAtTime(s_time, 315);
            NewProperty.property(2).setValueAtTime(s_time + duration, 315);
            // Feather
            NewProperty.property(3).setValueAtTime(s_time, 50);
            NewProperty.property(3).setValueAtTime(s_time + duration, 50);
        }
        if (direction == 2) {
            // fade out
            NewProperty.property(1).setValueAtTime(s_time, 0);
            NewProperty.property(1).setValueAtTime(s_time + duration, 100);
            NewProperty.property(2).setValueAtTime(s_time, 135);
            NewProperty.property(2).setValueAtTime(s_time + duration, 135);
            NewProperty.property(3).setValueAtTime(s_time, 50);
            NewProperty.property(3).setValueAtTime(s_time + duration, 50);
        }
    }
    return NewProperty;
}

function rank_part(RankData, FirstRank, NeedSpace, NeedProperty, GlobalOffset) {
    GlobalOffset = Number(GlobalOffset.toFixed(1));
    SortRank = [];
    for (rank in RankData) {
        SortRank[SortRank.length] = rank;
    }
    LastRank = Math.max.apply(Math, SortRank);

    for (i = 0; LastRank - i >= FirstRank; i++) {
        VideoFile = DirectoryPrefix + RankData[LastRank - i][0] + ".mp4";
        VideoMaskImage = DirectoryPrefix + RankData[LastRank - i][0] + ".png";
        VideoDuration = RankData[LastRank - i][1];
        VideoOffset = RankData[LastRank - i][2];
        VideoOffset = 0;
        NewVideoLayer = AddLayer(
            MasterComposition,
            VideoFile,
            VideoDuration,
            GlobalOffset - VideoOffset
        );
        NewVideoLayer.inPoint = GlobalOffset;
        NewVideoLayer.outPoint = GlobalOffset + VideoDuration;
        NewVideoLayer.inPoint = NewVideoLayer.outPoint - VideoDuration;
        NewVideoLayer.outPoint = NewVideoLayer.inPoint + VideoDuration;
        if (NeedProperty) {
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
        }
        AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
        AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
        VideoItemSize = NewVideoLayer.sourceRectAtTime(NewVideoLayer.inPoint, false);
        if (VideoItemSize.width / VideoItemSize.height >= 16 / 9) {
            NewVideoLayer.property("Scale").setValue([
                (NormalRankSize[0] / VideoItemSize.width) * 100,
                (NormalRankSize[0] / VideoItemSize.width) * 100,
            ]);
        } else {
            NewVideoLayer.property("Scale").setValue([
                (NormalRankSize[1] / VideoItemSize.height) * 100,
                (NormalRankSize[1] / VideoItemSize.height) * 100,
            ]);
        }
        NewVideoLayer.property("Position").setValue([640 - 149, 360 - 79]);

        CheckLost = false;
        for (lost in LostVideos) {
            if (RankData[LastRank - i][0] == LostVideos[lost]) CheckLost = true;
        }

        if (CheckLost == true) {
            VideoDuration = RankData[LastRank - i][1];
            // VideoOffset = RankData[LastRank - i][2];
            VideoOffset = 0;
            LostVideoLayer = AddLayer(MasterComposition, LostFile, VideoDuration, GlobalOffset);
            LostVideoLayer.inPoint = GlobalOffset;
            LostVideoLayer.outPoint = GlobalOffset + VideoDuration;
            if (NeedProperty) {
                AddVideoProperty(LostVideoLayer, 1, LostVideoLayer.inPoint, 0.6, 1);
                AddVideoProperty(LostVideoLayer, 1, LostVideoLayer.outPoint - 0.6, 0.6, 2);
            }
            AddAudioProperty(LostVideoLayer, 1, LostVideoLayer.inPoint, 0.6, 1);
            AddAudioProperty(LostVideoLayer, 1, LostVideoLayer.outPoint - 0.6, 0.6, 2);
            VideoItemSize = LostVideoLayer.sourceRectAtTime(LostVideoLayer.inPoint, false);
            if (VideoItemSize.width / VideoItemSize.height >= 16 / 9) {
                LostVideoLayer.property("Scale").setValue([
                    (NormalRankSize[0] / VideoItemSize.width) * 100,
                    (NormalRankSize[0] / VideoItemSize.width) * 100,
                ]);
            } else {
                LostVideoLayer.property("Scale").setValue([
                    (NormalRankSize[1] / VideoItemSize.height) * 100,
                    (NormalRankSize[1] / VideoItemSize.height) * 100,
                ]);
            }
            LostVideoLayer.property("Position").setValue([640 - 149, 360 - 79]);
        }
        NewVideoLayer_mask = AddLayer(
            MasterComposition,
            VideoMaskImage,
            VideoDuration,
            GlobalOffset
        );
        if (NeedSpace && LastRank - i > FirstRank) {
            ChangeLayer = AddLayer(
                MasterComposition,
                PublicImageDict["0_change"],
                1,
                GlobalOffset + VideoDuration
            );
            ChangeAudioLayer = AddLayer(
                MasterComposition,
                PublicAudioDict["0_change"],
                1,
                GlobalOffset + VideoDuration
            );
            GlobalOffset = GlobalOffset + VideoDuration + 1;
        } else if (LastRank - i > FirstRank) {
            GlobalOffset = GlobalOffset + VideoDuration;
        } else {
            if (CheckLost == true) {
                AddVideoProperty(LostVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            }
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            AddVideoProperty(NewVideoLayer_mask, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            GlobalOffset = GlobalOffset + VideoDuration;
        }
    }
    return GlobalOffset;
}

function FindItem(name) {
    items = app.project.items;
    i = 1;
    while (i <= items.length) {
        if (items[i].name == name) {
            return app.project.item(i);
        }
        i++;
    }
}

// Part 1
AudioLayer_1 = AddLayer(MasterComposition, PublicAudioDict["01_audio"], 40.5, 0);
AddAudioProperty(AudioLayer_1, 1, 38.2, 2.3, 2);

BlankLayer_1 = AddLayer(MasterComposition, PublicImageDict["0_blank_1"], 44.5, 0);

TitleLayer_1 = AddLayer(MasterComposition, PublicImageDict["01_title"], 4.5, 0);
AddVideoProperty(TitleLayer_1, 1, 0, 0.6, 1);
AddVideoProperty(TitleLayer_1, 1, 3.9, 0.6, 2);

WarnLayer_1 = AddLayer(MasterComposition, PublicImageDict["01_warn_1"], 2.3, 4.7);
AddVideoProperty(WarnLayer_1, 2, 4.7, 0.3, 1);

WarnLayer_2 = AddLayer(MasterComposition, PublicImageDict["01_warn_2"], 2.3, 7);
AddVideoProperty(WarnLayer_2, 2, 9, 0.3, 2);

WorldLayer = AddLayer(MasterComposition, PublicImageDict["01_world"], 4.5, 9.5);
AddVideoProperty(WorldLayer, 1, 9.5, 0.3, 1);
AddVideoProperty(WorldLayer, 1, 13.7, 0.3, 2);

StartLayer = AddLayer(MasterComposition, PublicImageDict["01_start"], 4.5, 14.3);
AddVideoProperty(StartLayer, 2, 14.3, 0.3, 1);
AddVideoProperty(StartLayer, 1, 18.5, 0.3, 2);

OpeningLayer = AddLayer(MasterComposition, PublicImageDict["01_op"], 4.8, 19);
AddVideoProperty(OpeningLayer, 1, 19, 0.5, 1);
AddVideoProperty(OpeningLayer, 1, 23.3, 0.5, 2);

RuleLayer_1 = AddLayer(MasterComposition, PublicImageDict["01_rule_1"], 4.3, 24);
AddVideoProperty(RuleLayer_1, 2, 24, 0.6, 1);

RuleLayer_2 = AddLayer(MasterComposition, PublicImageDict["01_rule_2"], 4.2, 28.3);
RuleLayer_3 = AddLayer(MasterComposition, PublicImageDict["01_rule_3"], 4, 32.5);
RuleLayer_4 = AddLayer(MasterComposition, PublicImageDict["01_rule_4"], 4, 36.5);
AddVideoProperty(RuleLayer_4, 2, 39.8, 0.7, 2);

BGMLayer = AddLayer(MasterComposition, PublicImageDict["01_bgm"], 5.5, 0.5);
AddVideoProperty(BGMLayer, 2, 0, 2, 1);
AddVideoProperty(BGMLayer, 2, 4, 2, 2);

// Part 2
AudioLayer_2 = AddLayer(MasterComposition, PublicAudioDict["02_audio"], 4, 40.5);
AddAudioProperty(AudioLayer_2, 1, 40.5, 1, 1);
AddAudioProperty(AudioLayer_2, 1, 43.5, 1, 2);

NextLayer_2 = AddLayer(MasterComposition, PublicImageDict["02_next"], 4, 40.5);
AddVideoProperty(NextLayer_2, 2, 40.5, 1, 1);

GlobalRankOffset = 44.5;

// Part 3
GlobalRankOffset = rank_part(PickupData, 1, false, true, GlobalRankOffset);

// Part 4
BlankLayer_4 = AddLayer(MasterComposition, PublicImageDict["0_blank_1"], 4, GlobalRankOffset);

NextLayerAudio_4 = AddLayer(MasterComposition, PublicAudioDict["0_next"], 4, GlobalRankOffset);
AddAudioProperty(NextLayerAudio_4, 1, GlobalRankOffset + 3, 1, 2);

NextLayer_4 = AddLayer(MasterComposition, PublicImageDict["04_next"], 4, GlobalRankOffset);
AddVideoProperty(NextLayer_4, 2, GlobalRankOffset, 1, 1);

GlobalRankOffset = GlobalRankOffset + 4;

// Part 5 (30+ to 21)

GlobalRankOffset = rank_part(RankData_5, 21, true, false, GlobalRankOffset);

// Part 6 (tv & bangumi)
BlankLayer_6 = AddLayer(MasterComposition, PublicImageDict["0_blank_2"], 49.1, GlobalRankOffset);

AudioLayer_6 = AddLayer(
    MasterComposition,
    PublicAudioDict["06_audio"],
    49.1,
    GlobalRankOffset - 30
);
AudioLayer_6.inPoint = GlobalRankOffset;
AudioLayer_6.outPoint = GlobalRankOffset + 49.1;
AddAudioProperty(AudioLayer_6, 1, AudioLayer_6.inPoint, 1.8, 1);
AddAudioProperty(AudioLayer_6, 1, AudioLayer_6.outPoint - 3.2, 3.2, 2);

FilmLayer = AddLayer(MasterComposition, PublicImageDict["06_film"], 3.73, GlobalRankOffset);
AddVideoProperty(FilmLayer, 2, GlobalRankOffset, 0.5, 1);
AddVideoProperty(FilmLayer, 2, GlobalRankOffset + 3.23, 0.5, 2);

RankLayer_6_1 = AddLayer(
    MasterComposition,
    PublicImageDict["06_tv_001"],
    7.6,
    GlobalRankOffset + 4
);
AddVideoProperty(RankLayer_6_1, 2, GlobalRankOffset + 4, 0.5, 1);
RankLayer_6_2 = AddLayer(
    MasterComposition,
    PublicImageDict["06_tv_002"],
    7,
    GlobalRankOffset + 11.6
);
RankLayer_6_3 = AddLayer(
    MasterComposition,
    PublicImageDict["06_tv_003"],
    7,
    GlobalRankOffset + 18.6
);
AddVideoProperty(RankLayer_6_3, 2, GlobalRankOffset + 25, 0.6, 2);

RankLayer_6_cn_sub = AddLayer(
    MasterComposition,
    PublicImageDict["06_cn_sub"],
    3.6,
    GlobalRankOffset + 26
);
AddVideoProperty(RankLayer_6_cn_sub, 2, GlobalRankOffset + 26, 0.5, 1);
AddVideoProperty(RankLayer_6_cn_sub, 2, GlobalRankOffset + 29.1, 0.5, 2);

RankLayer_6_bgm_4 = AddLayer(
    MasterComposition,
    PublicImageDict["06_bgm_004"],
    7.5,
    GlobalRankOffset + 30
);
AddVideoProperty(RankLayer_6_bgm_4, 2, GlobalRankOffset + 30, 0.5, 1);

RankLayer_6_bgm_5 = AddLayer(
    MasterComposition,
    PublicImageDict["06_bgm_005"],
    8.4,
    GlobalRankOffset + 37.5
);
AddVideoProperty(RankLayer_6_bgm_5, 2, GlobalRankOffset + 44.5, 0.5, 2);

RankLayer_6_cn_main = AddLayer(
    MasterComposition,
    PublicImageDict["06_cn_main"],
    3.7,
    GlobalRankOffset + 45.4
);
AddVideoProperty(RankLayer_6_cn_main, 2, GlobalRankOffset + 45.4, 0.6, 1);

GlobalRankOffset = GlobalRankOffset + 49.1;

// Part 7 (tv & bangumi)
GlobalRankOffset = rank_part(RankData_7, 1, false, false, GlobalRankOffset);

// Part 8
BlankLayer_8 = AddLayer(MasterComposition, PublicImageDict["0_blank_1"], 4, GlobalRankOffset);

NextLayerAudio_8 = AddLayer(MasterComposition, PublicAudioDict["0_next"], 4, GlobalRankOffset);
AddAudioProperty(NextLayerAudio_8, 1, GlobalRankOffset + 3, 1, 2);

NextLayer_8 = AddLayer(MasterComposition, PublicImageDict["08_next"], 4, GlobalRankOffset);
AddVideoProperty(NextLayer_8, 2, GlobalRankOffset, 1, 1);

GlobalRankOffset = GlobalRankOffset + 4;

// Part 9 (20 to 11)
GlobalRankOffset = rank_part(RankData_9, 11, true, false, GlobalRankOffset);

// Part 10 (bangumi)
BlankLayer_10 = AddLayer(MasterComposition, PublicImageDict["0_blank_2"], 33, GlobalRankOffset);

AudioLayer_10 = AddLayer(
    MasterComposition,
    PublicAudioDict["10_audio"],
    33,
    GlobalRankOffset - 4.3
);
AudioLayer_10.inPoint = GlobalRankOffset;
AudioLayer_10.outPoint = GlobalRankOffset + 33;
AddAudioProperty(AudioLayer_10, 1, AudioLayer_10.inPoint, 1.73, 1);
AddAudioProperty(AudioLayer_10, 1, AudioLayer_10.outPoint - 3, 3, 2);

BangumiLayer = AddLayer(MasterComposition, PublicImageDict["10_bangumi"], 5, GlobalRankOffset);
AddVideoProperty(BangumiLayer, 2, GlobalRankOffset, 0.5, 1);
AddVideoProperty(BangumiLayer, 2, GlobalRankOffset + 4.5, 0.5, 2);

BangumiLayer_1 = AddLayer(
    MasterComposition,
    PublicImageDict["10_bgm_001"],
    7,
    GlobalRankOffset + 5.3
);
AddVideoProperty(BangumiLayer_1, 2, GlobalRankOffset + 5.3, 0.5, 1);
BangumiLayer_2 = AddLayer(
    MasterComposition,
    PublicImageDict["10_bgm_002"],
    7,
    GlobalRankOffset + 12.3
);
BangumiLayer_3 = AddLayer(
    MasterComposition,
    PublicImageDict["10_bgm_003"],
    7,
    GlobalRankOffset + 19.3
);
AddVideoProperty(BangumiLayer_3, 2, GlobalRankOffset + 25.8, 0.5, 2);

BangumiTopLayer = AddLayer(
    MasterComposition,
    PublicImageDict["10_bgm_main"],
    6.4,
    GlobalRankOffset + 26.6
);
AddVideoProperty(BangumiTopLayer, 1, GlobalRankOffset + 26.6, 1, 1);

GlobalRankOffset = GlobalRankOffset + 33;

// Part 11 (bangumi)
GlobalRankOffset = rank_part(RankData_11, 1, false, false, GlobalRankOffset);

// Part 12
BlankLayer_12 = AddLayer(MasterComposition, PublicImageDict["0_blank_1"], 4, GlobalRankOffset);

NextLayerAudio_12 = AddLayer(MasterComposition, PublicAudioDict["0_next"], 4, GlobalRankOffset);
AddAudioProperty(NextLayerAudio_12, 1, GlobalRankOffset + 3, 1, 2);

NextLayer_12 = AddLayer(MasterComposition, PublicImageDict["12_next"], 4, GlobalRankOffset);
AddVideoProperty(NextLayer_12, 2, GlobalRankOffset, 1, 1);

GlobalRankOffset = GlobalRankOffset + 4;

// Part 13 (10 to 1)
GlobalRankOffset = rank_part(RankData_13, 4, true, false, GlobalRankOffset);

// Part 14
BlankLayer_14 = AddLayer(MasterComposition, PublicImageDict["0_blank_2"], 14.4, GlobalRankOffset);

AudioLayer_14 = AddLayer(MasterComposition, PublicAudioDict["14_audio"], 14.4, GlobalRankOffset);
AudioLayer_14.inPoint = GlobalRankOffset;
AudioLayer_14.outPoint = GlobalRankOffset + 14.4;
AddAudioProperty(AudioLayer_14, 1, AudioLayer_14.outPoint - 1, 1, 2);

RecordLayer = AddLayer(
    MasterComposition,
    PublicImageDict["14_record"],
    7.2,
    GlobalRankOffset + 0.2
);
AddVideoProperty(RecordLayer, 1, GlobalRankOffset + 0.2, 0.5, 1);
AddVideoProperty(RecordLayer, 1, GlobalRankOffset + 6.9, 0.5, 2);

HistoryLayer = AddLayer(
    MasterComposition,
    PublicImageDict["14_history"],
    6.5,
    GlobalRankOffset + 7.9
);
AddVideoProperty(HistoryLayer, 1, GlobalRankOffset + 7.9, 0.5, 1);

GlobalRankOffset = GlobalRankOffset + 14.4;

// Part 15 (history)
GlobalRankOffset = rank_part(RankData_15, 1, false, false, GlobalRankOffset);

// Part 16 (3 to 1)
GlobalOffset = GlobalRankOffset;
SortRank = [];
for (rank in RankData_16) {
    SortRank[SortRank.length] = rank;
}
LastRank = Math.max.apply(Math, SortRank);
for (i = 0; LastRank - i >= 1; i++) {
    VideoFile = DirectoryPrefix + RankData_16[LastRank - i][0] + ".mp4";
    VideoMaskImage = DirectoryPrefix + RankData_16[LastRank - i][0] + ".png";
    TopImage = DirectoryPrefix + RankData_16[LastRank - i][0] + "_.png";
    VideoDuration = RankData_16[LastRank - i][1];
    VideoOffset = RankData_16[LastRank - i][2];
    VideoOffset = 0;
    NewVideoLayer = AddLayer(
        MasterComposition,
        VideoFile,
        VideoDuration,
        GlobalOffset - VideoOffset
    );
    NewVideoLayer.inPoint = GlobalOffset;
    NewVideoLayer.outPoint = GlobalOffset + VideoDuration;
    AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 3, 3, 2);
    AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 1, 1);
    AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 3, 3, 2);
    VideoItemSize = NewVideoLayer.sourceRectAtTime(NewVideoLayer.inPoint, false);
    if (VideoItemSize.width / VideoItemSize.height >= 16 / 9) {
        NewVideoLayer.property("Scale").setValue([
            (1280 / VideoItemSize.width) * 100,
            (1280 / VideoItemSize.width) * 100,
        ]);
    } else {
        NewVideoLayer.property("Scale").setValue([
            (720 / VideoItemSize.height) * 100,
            (720 / VideoItemSize.height) * 100,
        ]);
    }
    NewVideoLayer.property("Position").setValue([640, 360]);
    LogoLayer = AddLayer(
        MasterComposition,
        PublicImageDict["16_logo"],
        VideoDuration + 0.6,
        GlobalOffset
    );
    LogoLayer.property("Scale").setValue([(1280 / 640) * 100, (720 / 384) * 100]);
    LogoLayer.property("Position").setValue([640, 360]);
    // 12 seconds
    NewVideoLayer_small = AddLayer(MasterComposition, VideoFile, 12, GlobalOffset - VideoOffset);
    NewVideoLayer_small.audioEnabled = false;
    NewVideoLayer_small.inPoint = NewVideoLayer.inPoint;
    NewVideoLayer_small.outPoint = NewVideoLayer.inPoint + 12;
    VideoItemSize = NewVideoLayer_small.sourceRectAtTime(NewVideoLayer_small.inPoint, false);
    if (VideoItemSize.width / VideoItemSize.height >= 16 / 9) {
        NewVideoLayer_small.property("Scale").setValue([
            (NormalRankSize[0] / VideoItemSize.width) * 100,
            (NormalRankSize[0] / VideoItemSize.width) * 100,
        ]);
    } else {
        NewVideoLayer_small.property("Scale").setValue([
            (NormalRankSize[1] / VideoItemSize.height) * 100,
            (NormalRankSize[1] / VideoItemSize.height) * 100,
        ]);
    }
    NewVideoLayer_small.property("Position").setValue([640 - 149, 360 - 79]);
    AddLayer(MasterComposition, PublicImageDict["0_blank_1"], 5, GlobalOffset);
    AddLayer(MasterComposition, VideoMaskImage, 7, GlobalOffset + 5);
    TopRankLayer = AddLayer(MasterComposition, TopImage, 5, GlobalOffset);
    AddVideoProperty(TopRankLayer, 1, GlobalOffset, 1, 1);
    GlobalOffset = GlobalOffset + VideoDuration + 0.6;
}
GlobalRankOffset = GlobalRankOffset + 91.8;

// Part 17
BlankLayer_17 = AddLayer(MasterComposition, PublicImageDict["0_blank_3"], 25, GlobalRankOffset);
AddVideoProperty(BlankLayer_17, 1, GlobalRankOffset + 24.5, 0.5, 2);

bilibili_layer = AddLayer(MasterComposition, PublicAudioDict["17_audio"], 25, GlobalRankOffset);
bilibili_layer.inPoint = GlobalRankOffset;
bilibili_layer.outPoint = GlobalRankOffset + 25;
AddAudioProperty(bilibili_layer, 1, bilibili_layer.outPoint - 3, 3, 2);

stat_1_layer = AddLayer(
    MasterComposition,
    PublicImageDict["17_stat_1"],
    7.33,
    GlobalRankOffset + 0.8
);
AddVideoProperty(stat_1_layer, 2, GlobalRankOffset + 0.8, 0.6, 1);
stat_2_layer = AddLayer(
    MasterComposition,
    PublicImageDict["17_stat_2"],
    5.27,
    GlobalRankOffset + 8.13
);
stat_3_layer = AddLayer(
    MasterComposition,
    PublicImageDict["17_stat_3"],
    5.8,
    GlobalRankOffset + 13.4
);
AddVideoProperty(stat_3_layer, 2, GlobalRankOffset + 18.6, 0.6, 2);

over_layer = AddLayer(MasterComposition, PublicImageDict["17_over"], 5.5, GlobalRankOffset + 19.5);
AddVideoProperty(over_layer, 2, GlobalRankOffset + 19.5, 0.5, 1);
AddVideoProperty(over_layer, 2, GlobalRankOffset + 24.5, 0.5, 2);

GlobalRankOffset = GlobalRankOffset + 25;

// Part 18 (30+ to 150 +)
AudioLayer_18 = AddLayer(MasterComposition, PublicAudioDict["18_audio"], null, GlobalRankOffset);
EDAudioLength = FindItem("ed.mp3").duration;
AudioLayer_18.inPoint = GlobalRankOffset;
AudioLayer_18.outPoint = GlobalRankOffset + EDAudioLength;
BlankLayer_18 = AddLayer(MasterComposition, PublicImageDict["0_blank_1"], 5, GlobalRankOffset + 1);
BlankLayer_18 = AddLayer(
    MasterComposition,
    PublicImageDict["0_blank_2"],
    EDAudioLength - 9,
    GlobalRankOffset + 9
);
AddVideoProperty(BlankLayer_18, 1, GlobalRankOffset + EDAudioLength - 1, 1, 2);
AddAudioProperty(AudioLayer_18, 1, GlobalRankOffset, 0.6, 1);
AddAudioProperty(AudioLayer_18, 1, GlobalRankOffset + EDAudioLength - 1, 1, 2);

SubRankLength = (EDAudioLength - 19.5) / 30;
for (i = 1; i < 30; i++) {
    AddLayer(
        MasterComposition,
        PublicImageDict[i],
        SubRankLength,
        GlobalRankOffset + 9 + (i - 1) * SubRankLength
    );
}
LastRankCardLayer = AddLayer(
    MasterComposition,
    PublicImageDict[i],
    SubRankLength,
    GlobalRankOffset + 9 + SubRankLength * 29
);
AddVideoProperty(LastRankCardLayer, 1, GlobalRankOffset + 9 + SubRankLength * 30 - 0.6, 0.6, 2);

StaffLayer = AddLayer(MasterComposition, PublicImageDict["18_staff"], 4.6, GlobalRankOffset);
AddVideoProperty(StaffLayer, 1, GlobalRankOffset, 0.6, 1);
AddVideoProperty(StaffLayer, 1, GlobalRankOffset + 4, 0.6, 2);
NextLayer_18 = AddLayer(MasterComposition, PublicImageDict["18_next"], 5.9, GlobalRankOffset + 4);
AddVideoProperty(NextLayer_18, 1, GlobalRankOffset + 4, 0.6, 1);
AddVideoProperty(NextLayer_18, 1, GlobalRankOffset + 9.3, 0.6, 2);

AddrLayer = AddLayer(
    MasterComposition,
    PublicImageDict["18_addr"],
    5,
    GlobalRankOffset + EDAudioLength - 10
);
AddVideoProperty(AddrLayer, 1, GlobalRankOffset + EDAudioLength - 10, 0.6, 1);
AddVideoProperty(AddrLayer, 1, GlobalRankOffset + EDAudioLength - 5.6, 0.6, 2);
EdCardLayer = AddLayer(
    MasterComposition,
    PublicImageDict["18_ed"],
    5,
    GlobalRankOffset + EDAudioLength - 5
);
AddVideoProperty(EdCardLayer, 1, GlobalRankOffset + EDAudioLength - 5, 0.6, 1);
AddVideoProperty(EdCardLayer, 1, GlobalRankOffset + EDAudioLength - 1, 1, 2);

MasterComposition.openInViewer();

MasterComposition.duration = GlobalRankOffset + EDAudioLength + 0.1;
app.project.save(File(".\\AutoBiliRank.aep"));
renderQueue = app.project.renderQueue;
render = renderQueue.items.add(MasterComposition);
render.outputModules[1].file = new File(".\\output_" + weeks + ".mp4");
app.project.renderQueue.queueInAME(false);
