// @include "json2.js"
YUME = 1277009809;
WEEK_NUM = Math.round((Date.now() / 1000 - YUME) / 3600 / 24 / 7);

CompSize = [1920, 1080];
CompFPS = 60;
RankSize = [1440, 810];
Prefix = "./ranking/list1/";
Regex = /- :rank: (\d+)\n  :name: (\w+)\n  :length: (\d+)\n  :offset: (\d+)(\n  :short: \d+)?(\n  :no_pause: true)?/gm;
Subst = '$1: ["$2", $3, $4],';
Parts = [3, 5, 7, 9, 11, 13, 15, 16];
RankDataList = [];
for (n = 0; n < Parts.length; n++) {
    file = new File(Prefix + WEEK_NUM + "_" + Parts[n] + ".yml");
    file.open("r");
    content = file.read();
    file.close();
    RankList = content.replace(Regex, Subst).replace("'", '"').replace("---", "{") + "}";
    RankDataList[RankDataList.length] = JSON.parse(RankList);
}
file = new File("LostFile.json");
file.open("r");
content = file.read();
file.close();
LostVideos = JSON.parse(content)["name"];

PickupData = RankDataList[0];
RankData_5 = RankDataList[1];
RankData_7 = RankDataList[2];
RankData_9 = RankDataList[3];
RankData_11 = RankDataList[4];
RankData_13 = RankDataList[5];
RankData_15 = RankDataList[6];
RankData_16 = RankDataList[7];

app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
app.newProject();
app.project.workingSpace = "Rec.709 Gamma 2.4";
app.project.bitsPerChannel = 8;
FinalComp = app.project.items.addComp("周刊哔哩哔哩排行榜#" + WEEK_NUM, CompSize[0], CompSize[1], 1, 1, CompFPS);
Part_1 = app.project.items.addComp("Part_1", CompSize[0], CompSize[1], 1, 40.5, CompFPS);
Part_2 = app.project.items.addComp("Part_2", CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_3 = app.project.items.addComp("Part_3", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_4 = app.project.items.addComp("Part_4", CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_5 = app.project.items.addComp("Part_5", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_6 = app.project.items.addComp("Part_6", CompSize[0], CompSize[1], 1, 49.1, CompFPS);
Part_7 = app.project.items.addComp("Part_7", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_8 = app.project.items.addComp("Part_8", CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_9 = app.project.items.addComp("Part_9", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_10 = app.project.items.addComp("Part_10", CompSize[0], CompSize[1], 1, 33, CompFPS);
Part_11 = app.project.items.addComp("Part_11", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_12 = app.project.items.addComp("Part_12", CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_13 = app.project.items.addComp("Part_13", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_14 = app.project.items.addComp("Part_14", CompSize[0], CompSize[1], 1, 14.4, CompFPS);
Part_15 = app.project.items.addComp("Part_15", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_16 = app.project.items.addComp("Part_16", CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_17 = app.project.items.addComp("Part_17", CompSize[0], CompSize[1], 1, 25, CompFPS);
Part_18 = app.project.items.addComp("Part_18", CompSize[0], CompSize[1], 1, 60, CompFPS);

StaticFolder = app.project.items.addFolder("StaticFootage");
WeeklyFolder = app.project.items.addFolder("WeeklyFootage");

StaticFootage = {
    // IMAGE
    黑底: "./public/black.png",
    蓝底: "./public/blank.png",
    棕底: "./public/bg_2.png",
    NEXT: "./public/change.png",
    夏之随想: "./public/bgm.png",
    Opening: "./ranking/1_op/op_2.png",
    规则说明: "./ranking/pic/rule_1.png",
    特殊说明: "./ranking/pic/rule_2.png",
    普通规则: "./ranking/pic/rule_3.png",
    新番规则: "./ranking/pic/rule_4.png",
    集计时间: "./ranking/1_op/start.png",
    标题: "./ranking/1_op/title.png",
    注意事项_1: "./public/warn_1.png",
    注意事项_2: "./public/warn_2.png",
    哔哩哔哩: "./ranking/1_op/world.png",
    Pickup切换: "./ranking/pic/_pickup.png",
    主榜切换_1: "./ranking/pic/_1.png",
    国创副榜_1: "./ranking/list4/bangumi_004.png",
    国创副榜_2: "./ranking/list4/bangumi_005.png",
    国创切换: "./ranking/pic/guochuang_zhu.png",
    国创副榜: "./ranking/pic/guochuang_fu.png",
    影视切换: "./ranking/pic/film.png",
    影视副榜_1: "./ranking/list3/tv_001.png",
    影视副榜_2: "./ranking/list3/tv_002.png",
    影视副榜_3: "./ranking/list3/tv_003.png",
    主榜切换_2: "./ranking/pic/_3.png",
    新番切换: "./ranking/pic/bangumi.png",
    新番副榜_1: "./ranking/list4/bangumi_001.png",
    新番副榜_2: "./ranking/list4/bangumi_002.png",
    新番副榜_3: "./ranking/list4/bangumi_003.png",
    新番主榜: "./ranking/pic/bangumitop10.png",
    主榜切换_3: "./ranking/pic/_4.png",
    历史切换: "./ranking/pic/history.png",
    历史记录: "./ranking/pic/history_record.png",
    周刊Logo: "./public/logo.png",
    本周结语: "./ranking/pic/over.png",
    统计数据1: "./ranking/pic/stat_1.png",
    统计数据2: "./ranking/pic/stat_2.png",
    统计数据3: "./ranking/pic/stat_3.png",
    插入素材: "./ranking/2_ed/addr2.png",
    EDCard: "./ranking/2_ed/ed.png",
    主榜切换_4: "./ranking/pic/_5.png",
    STAFF名单: "./ranking/2_ed/staff.png",
    1: "./ranking/list2/001.png",
    2: "./ranking/list2/002.png",
    3: "./ranking/list2/003.png",
    4: "./ranking/list2/004.png",
    5: "./ranking/list2/005.png",
    6: "./ranking/list2/006.png",
    7: "./ranking/list2/007.png",
    8: "./ranking/list2/008.png",
    9: "./ranking/list2/009.png",
    10: "./ranking/list2/010.png",
    11: "./ranking/list2/011.png",
    12: "./ranking/list2/012.png",
    13: "./ranking/list2/013.png",
    14: "./ranking/list2/014.png",
    15: "./ranking/list2/015.png",
    16: "./ranking/list2/016.png",
    17: "./ranking/list2/017.png",
    18: "./ranking/list2/018.png",
    19: "./ranking/list2/019.png",
    20: "./ranking/list2/020.png",
    21: "./ranking/list2/021.png",
    22: "./ranking/list2/022.png",
    23: "./ranking/list2/023.png",
    24: "./ranking/list2/024.png",
    25: "./ranking/list2/025.png",
    26: "./ranking/list2/026.png",
    27: "./ranking/list2/027.png",
    28: "./ranking/list2/028.png",
    29: "./ranking/list2/029.png",
    30: "./ranking/list2/030.png",
    // AUDIO
    NEXT_BGM: "./public/av2313.mp3",
    主榜切换_BGM: "./public/bilibili-mubox.wav",
    夏之随想_BGM: "./public/Summer.mp3",
    Pickup_BGM: "./public/a-3s-new.wav",
    影视国创_BGM: "./ranking/list4/04.MIRACLE RUSH (inst.).mp3",
    新番副榜_BGM: "./public/05 Zzz (Instrumental).mp3",
    历史数据_BGM: "./public/1.mp3",
    哔哩哔哩_BGM: "./public/bilibili.mp3",
    ED_BGM: "./ranking/2_ed/ed.mp3",
    // VIDEO
    NotFound: "./tv_x264.mp4",
};

for (key in StaticFootage) {
    FootageFile = new ImportOptions(File(StaticFootage[key]));
    FootageFile.ImportAs = ImportAsType.FOOTAGE;
    FileItem = app.project.importFile(FootageFile);
    FileItem.name = key;
    FileItem.parentFolder = StaticFolder;
}

for (n = 0; n < RankDataList.length; n++) {
    // IMPORT VIDEO
    for (key in RankDataList[n]) {
        FileBaseName = RankDataList[n][key][0];
        FileFullPath = Prefix + FileBaseName + ".mp4";
        FootageFile = new ImportOptions(File(FileFullPath));
        FootageFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(FootageFile);
        FileItem.name = RankDataList[n][key][0];
        FileItem.parentFolder = WeeklyFolder;
    }
    // IMPORT IMAGE
    for (key in RankDataList[n]) {
        FileBaseName = RankDataList[n][key][0];
        if (n == 7) {
            FileFullPath = Prefix + FileBaseName + "_.png";
            FootageFile = new ImportOptions(File(FileFullPath));
            FootageFile.ImportAs = ImportAsType.FOOTAGE;
            FileItem = app.project.importFile(FootageFile);
            FileItem.name = RankDataList[n][key][0] + "_m";
            FileItem.parentFolder = WeeklyFolder;
        }
        FileFullPath = Prefix + FileBaseName + ".png";
        FootageFile = new ImportOptions(File(FileFullPath));
        FootageFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(FootageFile);
        FileItem.name = RankDataList[n][key][0] + "_";
        FileItem.parentFolder = WeeklyFolder;
    }
}

// ITEM INDEX
ResourceID = {};
for (n = 1; n <= app.project.items.length; n++) {
    ResourceID[app.project.items[n].name] = n;
}

// FUNCTION
function AddLayer(target, filename, duration, s_time) {
    NewLayer = target.layers.add(app.project.items[ResourceID[filename]], duration);
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
                NewProperty.setValueAtTime(t, ((Math.cos((Math.PI * (t - s_time)) / duration) + 1) / 2) * 100);
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

function AddRankPart(Target, RankData, FirstRank, AddNEXT, AddProperty, Offset, IsTop) {
    SortRank = [];
    InvalidPos = [1100, 777];
    PartSize = RankSize;
    for (key in RankData) {
        SortRank[SortRank.length] = key;
    }
    LastRank = Math.max.apply(Math, SortRank);
    FirstRank = Math.min.apply(Math, SortRank);
    for (i = 0; LastRank - i >= FirstRank; i++) {
        if (!(LastRank - i in RankData)) {
            continue;
        }
        VideoFile = RankData[LastRank - i][0];
        VideoMask = RankData[LastRank - i][0] + "_";
        TopImage = RankData[LastRank - i][0] + "_m";
        VideoDuration = RankData[LastRank - i][1];
        TrueDuration = app.project.items[ResourceID[VideoFile]].duration;
        if (TrueDuration < VideoDuration) {
            VideoDuration = TrueDuration;
        }
        VideoOffset = RankData[LastRank - i][2];
        VideoOffset = 0;
        NewVideoLayer = AddLayer(Target, VideoFile, VideoDuration, Offset - VideoOffset);
        NewVideoLayer.inPoint = Offset;
        NewVideoLayer.outPoint = Offset + VideoDuration;
        NewVideoLayer.inPoint = NewVideoLayer.outPoint - VideoDuration;
        NewVideoLayer.outPoint = NewVideoLayer.inPoint + VideoDuration;
        NewVideoLayer.property("Position").setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
        NewVideoLayer.comment = LastRank - i + "-" + VideoFile;
        writeLn(NewVideoLayer.comment); // DEBUG
        if (IsTop) {
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 3, 3, 2);
            AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 1, 1);
            AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 3, 3, 2);
            NewVideoLayer.property("Position").setValue([CompSize[0] / 2, CompSize[1] / 2]);
            InvalidPos = [1500, 1020];
            PartSize = CompSize;
            LogoLayer = AddLayer(Target, "周刊Logo", VideoDuration + 0.6, Offset);
            LogoLayer.property("Scale").setValue([(CompSize[0] / 640) * 100, (CompSize[1] / 384) * 100]);
            LogoLayer.property("Position").setValue([CompSize[0] / 2, CompSize[1] / 2]);
        } else if (AddProperty) {
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
        }
        AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
        AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
        OrigSize = NewVideoLayer.sourceRectAtTime(NewVideoLayer.inPoint, false);
        if (OrigSize.width / OrigSize.height >= 16 / 9) {
            NewVideoLayer.property("Scale").setValue([
                (PartSize[0] / OrigSize.width) * 100,
                (PartSize[0] / OrigSize.width) * 100,
            ]);
        } else {
            NewVideoLayer.property("Scale").setValue([
                (PartSize[1] / OrigSize.height) * 100,
                (PartSize[1] / OrigSize.height) * 100,
            ]);
        }

        IsInvalid = false;
        for (key in LostVideos) {
            if (RankData[LastRank - i][0] == LostVideos[key]) {
                IsInvalid = true;
            }
        }
        if (IsInvalid == true) {
            VideoOffset = 0;
            InvalidLayer = AddLayer(Target, "NotFound", VideoDuration, Offset);
            InvalidLayer.inPoint = Offset;
            InvalidLayer.outPoint = Offset + VideoDuration;
            InvalidLayer.property("Position").setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
            InvalidText = Target.layers.addText("视频已失效");
            InvalidTextDoc = InvalidText.property("Source Text").value;
            InvalidTextDoc.resetCharStyle();
            //InvalidTextDoc.fontSize = 48;
            //InvalidTextDoc.fillColor = [0.8, 0, 0];
            InvalidTextDoc.applyFill = true;
            //InvalidTextDoc.font = "方正粗圆_GBK";
            InvalidTextDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            InvalidText.inPoint = Offset;
            InvalidText.outPoint = Offset + VideoDuration;
            InvalidText.property("Position").setValue(InvalidPos);
            InvalidText.property("Source Text").setValue(InvalidTextDoc);
            InvalidText.property("Source Text").expression =
                'text.sourceText.createStyle().setFont("FZY4K--GBK1-0").setFillColor(hexToRgb("CC0000")).setFontSize(48);';
            if (IsTop || AddProperty) {
                InvalidLayer.property("Position").setValue([CompSize[0] / 2, CompSize[1] / 2]);
                AddVideoProperty(InvalidLayer, 1, InvalidLayer.inPoint, 0.6, 1);
                AddVideoProperty(InvalidLayer, 1, InvalidLayer.outPoint - 0.6, 0.6, 2);
            }
            AddAudioProperty(InvalidLayer, 1, InvalidLayer.inPoint, 0.6, 1);
            AddAudioProperty(InvalidLayer, 1, InvalidLayer.outPoint - 0.6, 0.6, 2);
            OrigSize = InvalidLayer.sourceRectAtTime(InvalidLayer.inPoint, false);
            if (OrigSize.width / OrigSize.height >= 16 / 9) {
                InvalidLayer.property("Scale").setValue([
                    (PartSize[0] / OrigSize.width) * 100,
                    (PartSize[0] / OrigSize.width) * 100,
                ]);
            } else {
                InvalidLayer.property("Scale").setValue([
                    (PartSize[1] / OrigSize.height) * 100,
                    (PartSize[1] / OrigSize.height) * 100,
                ]);
            }
        }
        if (IsTop) {
            BlackLayer = AddLayer(Target, "黑底", 12, Offset - VideoOffset);
            NewVideoLayerS = AddLayer(Target, VideoFile, 12, Offset - VideoOffset);
            NewVideoLayerS.audioEnabled = false;
            NewVideoLayerS.inPoint = NewVideoLayer.inPoint;
            NewVideoLayerS.outPoint = NewVideoLayer.inPoint + 12;
            OrigSize = NewVideoLayerS.sourceRectAtTime(NewVideoLayerS.inPoint, false);
            if (OrigSize.width / OrigSize.height >= 16 / 9) {
                NewVideoLayerS.property("Scale").setValue([
                    (RankSize[0] / OrigSize.width) * 100,
                    (RankSize[0] / OrigSize.width) * 100,
                ]);
            } else {
                NewVideoLayerS.property("Scale").setValue([
                    (RankSize[1] / OrigSize.height) * 100,
                    (RankSize[1] / OrigSize.height) * 100,
                ]);
            }
            NewVideoLayerS.property("Position").setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
            if (IsInvalid == true) {
                VideoOffset = 0;
                LostVideoLayerS = AddLayer(Target, "NotFound", VideoDuration, Offset);
                LostVideoLayerS.inPoint = Offset;
                LostVideoLayerS.outPoint = LostVideoLayerS.inPoint + 12;
                InvalidTextLayerS = Target.layers.addText("视频已失效");
                InvalidTextDoc = InvalidTextLayerS.property("Source Text").value;
                InvalidTextDoc.resetCharStyle();
                InvalidTextDoc.applyFill = true;
                InvalidTextDoc.applyStroke = false;
                InvalidTextDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
                InvalidTextLayerS.inPoint = Offset;
                InvalidTextLayerS.outPoint = InvalidTextLayerS.inPoint + 12;
                InvalidTextLayerS.property("Position").setValue([1100, 777]);
                InvalidTextLayerS.property("Source Text").setValue(InvalidTextDoc);
                AddAudioProperty(LostVideoLayerS, 1, LostVideoLayerS.inPoint, 0.6, 1);
                AddAudioProperty(LostVideoLayerS, 1, LostVideoLayerS.outPoint - 0.6, 0.6, 2);
                OrigSize = LostVideoLayerS.sourceRectAtTime(LostVideoLayerS.inPoint, false);
                if (OrigSize.width / OrigSize.height >= 16 / 9) {
                    LostVideoLayerS.property("Scale").setValue([
                        (RankSize[0] / OrigSize.width) * 100,
                        (RankSize[0] / OrigSize.width) * 100,
                    ]);
                } else {
                    LostVideoLayerS.property("Scale").setValue([
                        (RankSize[1] / OrigSize.height) * 100,
                        (RankSize[1] / OrigSize.height) * 100,
                    ]);
                }
                LostVideoLayerS.property("Position").setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
            }
            AddLayer(Target, "蓝底", 5, Offset);
            AddLayer(Target, VideoMask, 7, Offset + 5);
            TopRankLayer = AddLayer(Target, TopImage, 5, Offset);
            AddVideoProperty(TopRankLayer, 1, Offset, 1, 1);
            Offset = Offset + VideoDuration + 0.6;
        } else {
            NewVideoLayer_mask = AddLayer(Target, VideoMask, VideoDuration, Offset);
            if (AddNEXT && LastRank - i > FirstRank) {
                NextBGMLayer = AddLayer(Target, "NEXT_BGM", 1, Offset + VideoDuration);
                NextLayer = AddLayer(Target, "NEXT", 1, Offset + VideoDuration);
                Offset = Offset + VideoDuration + 1;
            } else if (LastRank - i > FirstRank) {
                Offset = Offset + VideoDuration;
            } else {
                if (IsInvalid == true) {
                    AddVideoProperty(InvalidLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
                    AddVideoProperty(InvalidText, 1, InvalidText.outPoint - 0.6, 0.6, 2);
                }
                AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
                AddVideoProperty(NewVideoLayer_mask, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
                Offset = Offset + VideoDuration;
            }
        }
    }
    return Offset;
}

// Part 1
AudioLayer_1 = AddLayer(Part_1, "夏之随想_BGM", 40.5, 0);
AddAudioProperty(AudioLayer_1, 1, 38.2, 2.3, 2);

BlankLayer_1 = AddLayer(Part_1, "蓝底", 40.5, 0);

TitleLayer_1 = AddLayer(Part_1, "标题", 4.5, 0);
AddVideoProperty(TitleLayer_1, 1, 0, 0.6, 1);
AddVideoProperty(TitleLayer_1, 1, 3.9, 0.6, 2);

WarnLayer_1 = AddLayer(Part_1, "注意事项_1", 2.3, 4.7);
AddVideoProperty(WarnLayer_1, 2, 4.7, 0.3, 1);

WarnLayer_2 = AddLayer(Part_1, "注意事项_2", 2.3, 7);
AddVideoProperty(WarnLayer_2, 2, 9, 0.3, 2);

BGMLayer = AddLayer(Part_1, "夏之随想", 5.5, 0.5);
AddVideoProperty(BGMLayer, 2, 0, 2, 1);
AddVideoProperty(BGMLayer, 2, 4, 2, 2);

WorldLayer = AddLayer(Part_1, "哔哩哔哩", 4.5, 9.5);
AddVideoProperty(WorldLayer, 1, 9.5, 0.3, 1);
AddVideoProperty(WorldLayer, 1, 13.7, 0.3, 2);

StartLayer = AddLayer(Part_1, "集计时间", 4.5, 14.3);
AddVideoProperty(StartLayer, 2, 14.3, 0.3, 1);
AddVideoProperty(StartLayer, 1, 18.5, 0.3, 2);

OpeningLayer = AddLayer(Part_1, "Opening", 4.8, 19);
AddVideoProperty(OpeningLayer, 1, 19, 0.5, 1);
AddVideoProperty(OpeningLayer, 1, 23.3, 0.5, 2);

RuleLayer_1 = AddLayer(Part_1, "规则说明", 4.3, 24);
AddVideoProperty(RuleLayer_1, 2, 24, 0.6, 1);

RuleLayer_2 = AddLayer(Part_1, "特殊说明", 4.2, 28.3);
RuleLayer_3 = AddLayer(Part_1, "普通规则", 4, 32.5);
RuleLayer_4 = AddLayer(Part_1, "新番规则", 4, 36.5);
AddVideoProperty(RuleLayer_4, 2, 39.8, 0.7, 2);

Part_1.openInViewer();
CompBlackLayer = FinalComp.layers.addSolid([0, 0, 0], "黑底", CompSize[0], CompSize[1], 1, 1);
AddLayer(FinalComp, Part_1.name, Part_1.duration, FinalComp.duration - FinalComp.duration);
FinalComp.duration = Part_1.duration;

// Part 2
AudioLayer_2 = AddLayer(Part_2, "Pickup_BGM", 4, 0);
AddAudioProperty(AudioLayer_2, 1, 0, 1, 1);
AddAudioProperty(AudioLayer_2, 1, 3, 1, 2);

BlankLayer_2 = AddLayer(Part_2, "蓝底", 4, 0);
NextLayer_2 = AddLayer(Part_2, "Pickup切换", 4, 0);
AddVideoProperty(NextLayer_2, 2, 0, 1, 1);

Part_2.openInViewer();
AddLayer(FinalComp, Part_2.name, Part_2.duration, FinalComp.duration);
FinalComp.duration += Part_2.duration;

// Part 3
PartDuration = AddRankPart(Part_3, PickupData, 1, false, true, 0, false);

Part_3.duration = PartDuration;
Part_3.openInViewer();
AddLayer(FinalComp, Part_3.name, Part_3.duration, FinalComp.duration);
FinalComp.duration += Part_3.duration;

// Part 4
BlankLayer_4 = AddLayer(Part_4, "蓝底", 4, 0);

NextLayerAudio_4 = AddLayer(Part_4, "主榜切换_BGM", 4, 0);
AddAudioProperty(NextLayerAudio_4, 1, 0 + 3, 1, 2);

NextLayer_4 = AddLayer(Part_4, "主榜切换_1", 4, 0);
AddVideoProperty(NextLayer_4, 2, 0, 1, 1);

Part_4.openInViewer();
AddLayer(FinalComp, Part_4.name, Part_4.duration, FinalComp.duration);
FinalComp.duration += Part_4.duration;

// Part 5 (30+ to 21)
PartDuration = AddRankPart(Part_5, RankData_5, 21, true, false, 0, false);

Part_5.duration = PartDuration;
Part_5.openInViewer();
AddLayer(FinalComp, Part_5.name, Part_5.duration, FinalComp.duration);
FinalComp.duration += Part_5.duration;

// Part 6 (tv & bangumi)
BlankLayer_6 = AddLayer(Part_6, "棕底", 49.1, 0);

AudioLayer_6 = AddLayer(Part_6, "影视国创_BGM", 49.1, 0 - 30);
AudioLayer_6.inPoint = 0;
AudioLayer_6.outPoint = 0 + 49.1;
AddAudioProperty(AudioLayer_6, 1, AudioLayer_6.inPoint, 1.8, 1);
AddAudioProperty(AudioLayer_6, 1, AudioLayer_6.outPoint - 3.2, 3.2, 2);

FilmLayer = AddLayer(Part_6, "影视切换", 3.73, 0);
AddVideoProperty(FilmLayer, 2, 0, 0.5, 1);
AddVideoProperty(FilmLayer, 2, 0 + 3.23, 0.5, 2);

RankLayer_6_1 = AddLayer(Part_6, "影视副榜_1", 7.6, 0 + 4);
AddVideoProperty(RankLayer_6_1, 2, 0 + 4, 0.5, 1);
RankLayer_6_2 = AddLayer(Part_6, "影视副榜_2", 7, 0 + 11.6);
RankLayer_6_3 = AddLayer(Part_6, "影视副榜_3", 7, 0 + 18.6);
AddVideoProperty(RankLayer_6_3, 2, 0 + 25, 0.6, 2);

RankLayer_6_cn_sub = AddLayer(Part_6, "国创副榜", 3.6, 0 + 26);
AddVideoProperty(RankLayer_6_cn_sub, 2, 0 + 26, 0.5, 1);
AddVideoProperty(RankLayer_6_cn_sub, 2, 0 + 29.1, 0.5, 2);

RankLayer_6_bgm_4 = AddLayer(Part_6, "国创副榜_1", 7.5, 0 + 30);
AddVideoProperty(RankLayer_6_bgm_4, 2, 0 + 30, 0.5, 1);

RankLayer_6_bgm_5 = AddLayer(Part_6, "国创副榜_2", 8.4, 0 + 37.5);
AddVideoProperty(RankLayer_6_bgm_5, 2, 0 + 44.5, 0.5, 2);

RankLayer_6_cn_main = AddLayer(Part_6, "国创切换", 3.7, 0 + 45.4);
AddVideoProperty(RankLayer_6_cn_main, 2, 0 + 45.4, 0.6, 1);

Part_6.openInViewer();
AddLayer(FinalComp, Part_6.name, Part_6.duration, FinalComp.duration);
FinalComp.duration += Part_6.duration;

// Part 7 (tv & bangumi)
PartDuration = AddRankPart(Part_7, RankData_7, 1, false, false, 0, false);

Part_7.duration = PartDuration;
Part_7.openInViewer();
AddLayer(FinalComp, Part_7.name, Part_7.duration, FinalComp.duration);
FinalComp.duration += Part_7.duration;

// Part 8
BlankLayer_8 = AddLayer(Part_8, "蓝底", 4, 0);

NextLayerAudio_8 = AddLayer(Part_8, "主榜切换_BGM", 4, 0);
AddAudioProperty(NextLayerAudio_8, 1, 0 + 3, 1, 2);

NextLayer_8 = AddLayer(Part_8, "主榜切换_2", 4, 0);
AddVideoProperty(NextLayer_8, 2, 0, 1, 1);

Part_8.openInViewer();
AddLayer(FinalComp, Part_8.name, Part_8.duration, FinalComp.duration);
FinalComp.duration += Part_8.duration;

// Part 9 (20 to 11)
PartDuration = AddRankPart(Part_9, RankData_9, 11, true, false, 0, false);

Part_9.duration = PartDuration;
Part_9.openInViewer();
AddLayer(FinalComp, Part_9.name, Part_9.duration, FinalComp.duration);
FinalComp.duration += Part_9.duration;

// Part 10 (bangumi)
BlankLayer_10 = AddLayer(Part_10, "棕底", 33, 0);

AudioLayer_10 = AddLayer(Part_10, "新番副榜_BGM", 33, 0 - 4.3);
AudioLayer_10.inPoint = 0;
AudioLayer_10.outPoint = 0 + 33;
AddAudioProperty(AudioLayer_10, 1, AudioLayer_10.inPoint, 1.73, 1);
AddAudioProperty(AudioLayer_10, 1, AudioLayer_10.outPoint - 3, 3, 2);

BangumiLayer = AddLayer(Part_10, "新番切换", 5, 0);
AddVideoProperty(BangumiLayer, 2, 0, 0.5, 1);
AddVideoProperty(BangumiLayer, 2, 0 + 4.5, 0.5, 2);

BangumiLayer_1 = AddLayer(Part_10, "新番副榜_1", 7, 0 + 5.3);
AddVideoProperty(BangumiLayer_1, 2, 0 + 5.3, 0.5, 1);
BangumiLayer_2 = AddLayer(Part_10, "新番副榜_2", 7, 0 + 12.3);
BangumiLayer_3 = AddLayer(Part_10, "新番副榜_3", 7, 0 + 19.3);
AddVideoProperty(BangumiLayer_3, 2, 0 + 25.8, 0.5, 2);

BangumiTopLayer = AddLayer(Part_10, "新番主榜", 6.4, 0 + 26.6);
AddVideoProperty(BangumiTopLayer, 1, 0 + 26.6, 1, 1);

Part_10.openInViewer();
AddLayer(FinalComp, Part_10.name, Part_10.duration, FinalComp.duration);
FinalComp.duration += Part_10.duration;

// Part 11 (bangumi)
PartDuration = AddRankPart(Part_11, RankData_11, 1, false, false, 0, false);

Part_11.duration = PartDuration;
Part_11.openInViewer();
AddLayer(FinalComp, Part_11.name, Part_11.duration, FinalComp.duration);
FinalComp.duration += Part_11.duration;

// Part 12
BlankLayer_12 = AddLayer(Part_12, "蓝底", 4, 0);

NextLayerAudio_12 = AddLayer(Part_12, "主榜切换_BGM", 4, 0);
AddAudioProperty(NextLayerAudio_12, 1, 0 + 3, 1, 2);

NextLayer_12 = AddLayer(Part_12, "主榜切换_3", 4, 0);
AddVideoProperty(NextLayer_12, 2, 0, 1, 1);

Part_12.openInViewer();
AddLayer(FinalComp, Part_12.name, Part_12.duration, FinalComp.duration);
FinalComp.duration += Part_12.duration;

// Part 13 (10 to 4)
PartDuration = AddRankPart(Part_13, RankData_13, 4, true, false, 0, false);

Part_13.duration = PartDuration;
Part_13.openInViewer();
AddLayer(FinalComp, Part_13.name, Part_13.duration, FinalComp.duration);
FinalComp.duration += Part_13.duration;

// Part 14
BlankLayer_14 = AddLayer(Part_14, "棕底", 14.4, 0);

AudioLayer_14 = AddLayer(Part_14, "历史数据_BGM", 14.4, 0);
AudioLayer_14.inPoint = 0;
AudioLayer_14.outPoint = 0 + 14.4;
AddAudioProperty(AudioLayer_14, 1, AudioLayer_14.outPoint - 1, 1, 2);

RecordLayer = AddLayer(Part_14, "历史记录", 7.2, 0 + 0.2);
AddVideoProperty(RecordLayer, 1, 0 + 0.2, 0.5, 1);
AddVideoProperty(RecordLayer, 1, 0 + 6.9, 0.5, 2);

HistoryLayer = AddLayer(Part_14, "历史切换", 6.5, 0 + 7.9);
AddVideoProperty(HistoryLayer, 1, 0 + 7.9, 0.5, 1);

Part_14.openInViewer();
AddLayer(FinalComp, Part_14.name, Part_14.duration, FinalComp.duration);
FinalComp.duration += Part_14.duration;

// Part 15 (history)
PartDuration = AddRankPart(Part_15, RankData_15, 1, false, false, 0, false);

Part_15.duration = PartDuration;
Part_15.openInViewer();
AddLayer(FinalComp, Part_15.name, Part_15.duration, FinalComp.duration);
FinalComp.duration += Part_15.duration;

// Part 16 (3 to 1)
PartDuration = AddRankPart(Part_16, RankData_16, 1, false, false, 0, true);

Part_16.duration = PartDuration;
Part_16.openInViewer();
AddLayer(FinalComp, Part_16.name, Part_16.duration, FinalComp.duration);
FinalComp.duration += Part_16.duration;

// Part 17
BlankLayer_17 = AddLayer(Part_17, "棕底", 25, 0);
AddVideoProperty(BlankLayer_17, 1, 0 + 24.5, 0.5, 2);

bilibili_layer = AddLayer(Part_17, "哔哩哔哩_BGM", 25, 0);
bilibili_layer.inPoint = 0;
bilibili_layer.outPoint = 0 + 25;
AddAudioProperty(bilibili_layer, 1, bilibili_layer.outPoint - 3, 3, 2);

stat_1_layer = AddLayer(Part_17, "统计数据1", 7.33, 0 + 0.8);
AddVideoProperty(stat_1_layer, 2, 0 + 0.8, 0.6, 1);
stat_2_layer = AddLayer(Part_17, "统计数据2", 5.27, 0 + 8.13);
stat_3_layer = AddLayer(Part_17, "统计数据3", 5.8, 0 + 13.4);
AddVideoProperty(stat_3_layer, 2, 0 + 18.6, 0.6, 2);

over_layer = AddLayer(Part_17, "本周结语", 5.5, 0 + 19.5);
AddVideoProperty(over_layer, 2, 0 + 19.5, 0.5, 1);
AddVideoProperty(over_layer, 2, 0 + 24.5, 0.5, 2);

Part_17.openInViewer();
AddLayer(FinalComp, Part_17.name, Part_17.duration, FinalComp.duration);
FinalComp.duration += Part_17.duration;

// Part 18 (30+ to 150 +)
AudioLayer_18 = AddLayer(Part_18, "ED_BGM", null, 0);
EDAudioLength = app.project.items[ResourceID["ED_BGM"]].duration;
AudioLayer_18.inPoint = 0;
AudioLayer_18.outPoint = 0 + EDAudioLength;
BlankLayer_18 = AddLayer(Part_18, "蓝底", 5, 0 + 1);
BlankLayer_18 = AddLayer(Part_18, "棕底", EDAudioLength - 9, 0 + 9);
AddVideoProperty(BlankLayer_18, 1, 0 + EDAudioLength - 1, 1, 2);
AddAudioProperty(AudioLayer_18, 1, 0, 0.6, 1);
AddAudioProperty(AudioLayer_18, 1, 0 + EDAudioLength - 1, 1, 2);

SubRankLength = (EDAudioLength - 19.5) / 30;
for (i = 1; i < 30; i++) {
    AddLayer(Part_18, i, SubRankLength, 0 + 9 + (i - 1) * SubRankLength);
}
LastRankCardLayer = AddLayer(Part_18, i, SubRankLength, 0 + 9 + SubRankLength * 29);
AddVideoProperty(LastRankCardLayer, 1, 0 + 9 + SubRankLength * 30 - 0.6, 0.6, 2);

StaffLayer = AddLayer(Part_18, "STAFF名单", 4.6, 0);
AddVideoProperty(StaffLayer, 1, 0, 0.6, 1);
AddVideoProperty(StaffLayer, 1, 0 + 4, 0.6, 2);
NextLayer_18 = AddLayer(Part_18, "主榜切换_4", 5.9, 0 + 4);
AddVideoProperty(NextLayer_18, 1, 0 + 4, 0.6, 1);
AddVideoProperty(NextLayer_18, 1, 0 + 9.3, 0.6, 2);

AddrLayer = AddLayer(Part_18, "插入素材", 5, 0 + EDAudioLength - 10);
AddVideoProperty(AddrLayer, 1, 0 + EDAudioLength - 10, 0.6, 1);
AddVideoProperty(AddrLayer, 1, 0 + EDAudioLength - 5.6, 0.6, 2);
EdCardLayer = AddLayer(Part_18, "EDCard", 5, 0 + EDAudioLength - 5);
AddVideoProperty(EdCardLayer, 1, 0 + EDAudioLength - 5, 0.6, 1);
AddVideoProperty(EdCardLayer, 1, 0 + EDAudioLength - 1, 1, 2);

Part_18.duration = 0 + EDAudioLength + 0.1;
Part_18.openInViewer();
AddLayer(FinalComp, Part_18.name, Part_18.duration, FinalComp.duration);
FinalComp.duration += Part_18.duration;

CompBlackLayer.outPoint = FinalComp.duration;
FinalComp.openInViewer();
// app.project.save(File("./bilibilirank_" + WEEK_NUM + ".aep"));
