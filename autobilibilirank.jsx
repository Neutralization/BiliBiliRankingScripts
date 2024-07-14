// @include 'json2/json2.js';
app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
YUME = 1277009809;
WEEK_NUM = Math.floor((Date.now() / 1000 - YUME + 133009) / 3600 / 24 / 7);

CompFPS = 60;
CompSize = [1920, 1080];
RankSize = [1440, 810];
AlbumSize = [188, 188];
Prefix = './ranking/list1/';
Regex =
    /- :rank: (\d+)\n {2}:name: (\w+)\n {2}:length: (\d+)\n {2}:offset: (\d+)(\n {2}:short: \d+)?(\n {2}:no_pause: true)?/gm;
Subst = '"$1": ["$2", $3, $4],';
Parts = [3, 5, 7, 9, 11, 13, 15, 16];
file = new File('LostFile.json');
file.open('r');
content = file.read();
file.close();
LostVideos = JSON.parse(content).name;
RankDataList = [];
for (n = 0; n < Parts.length; n++) {
    file = new File(Prefix + WEEK_NUM + '_' + Parts[n] + '.yml');
    file.open('r');
    content = file.read();
    file.close();
    RankList = content.replace(Regex, Subst).replace('\'', '"').replace('---', '{') + '}';
    RankList = RankList.replace(',\n}', '\n}');
    RankDataList[RankDataList.length] = JSON.parse(RankList);
}
app.newProject();
app.project.workingSpace = 'Rec.709 Gamma 2.4';
app.project.bitsPerChannel = 8;
FinalComp = app.project.items.addComp('周刊哔哩哔哩排行榜#' + WEEK_NUM, CompSize[0], CompSize[1], 1, 1, CompFPS);
Part_1 = app.project.items.addComp('Part_1', CompSize[0], CompSize[1], 1, 40.5, CompFPS);
Part_2 = app.project.items.addComp('Part_2', CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_3 = app.project.items.addComp('Part_3', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_4 = app.project.items.addComp('Part_4', CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_5 = app.project.items.addComp('Part_5', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_6 = app.project.items.addComp('Part_6', CompSize[0], CompSize[1], 1, 56.6, CompFPS);
Part_7 = app.project.items.addComp('Part_7', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_8 = app.project.items.addComp('Part_8', CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_9 = app.project.items.addComp('Part_9', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_10 = app.project.items.addComp('Part_10', CompSize[0], CompSize[1], 1, 33, CompFPS);
Part_11 = app.project.items.addComp('Part_11', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_12 = app.project.items.addComp('Part_12', CompSize[0], CompSize[1], 1, 4, CompFPS);
Part_13 = app.project.items.addComp('Part_13', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_14 = app.project.items.addComp('Part_14', CompSize[0], CompSize[1], 1, 14.4, CompFPS);
Part_15 = app.project.items.addComp('Part_15', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_16 = app.project.items.addComp('Part_16', CompSize[0], CompSize[1], 1, 60, CompFPS);
Part_17 = app.project.items.addComp('Part_17', CompSize[0], CompSize[1], 1, 25, CompFPS);
Part_18 = app.project.items.addComp('Part_18', CompSize[0], CompSize[1], 1, 60, CompFPS);
CoverComp1 = app.project.items.addComp('封面_16-9', 1120, 630, 1, 1 / CompFPS, CompFPS);
CoverComp2 = app.project.items.addComp('封面_4-3', 960, 720, 1, 1 / CompFPS, CompFPS);

StaticFolder = app.project.items.addFolder('StaticFootage');
WeeklyFolder = app.project.items.addFolder('WeeklyFootage');

StaticFootage = {
    // IMAGE
    投稿封面_1: './footage/ANNIVERSARY.png',
    投稿封面_2: './footage/STANDARD.png',
    投稿封面_3: './footage/CHARA.png',
    蓝底: './public/blank.png',
    棕底: './public/bg_2.png',
    NEXT: './public/change.png',
    夏之随想: './public/bgm.png',
    Opening: './ranking/1_op/op_2.png',
    规则说明: './ranking/pic/rule_1.png',
    特殊说明: './ranking/pic/rule_2.png',
    普通规则: './ranking/pic/rule_3.png',
    新番规则: './ranking/pic/rule_4.png',
    集计时间: './ranking/1_op/start.png',
    标题: './ranking/1_op/title.png',
    注意事项_1: './public/warn_1.png',
    注意事项_2: './public/warn_2.png',
    哔哩哔哩: './ranking/1_op/world.png',
    Pickup_切换: './ranking/pic/_pickup.png',
    主榜切换_1: './ranking/pic/_1.png',
    国创副榜_1: './ranking/list4/bangumi_004.png',
    国创副榜_2: './ranking/list4/bangumi_005.png',
    国创副榜_3: './ranking/list4/bangumi_006.png',
    国创切换: './ranking/pic/guochuang_zhu.png',
    国创副榜: './ranking/pic/guochuang_fu.png',
    影视切换: './ranking/pic/film.png',
    影视副榜_1: './ranking/list3/tv_001.png',
    影视副榜_2: './ranking/list3/tv_002.png',
    影视副榜_3: './ranking/list3/tv_003.png',
    主榜切换_2: './ranking/pic/_3.png',
    新番切换: './ranking/pic/bangumi.png',
    新番副榜_1: './ranking/list4/bangumi_001.png',
    新番副榜_2: './ranking/list4/bangumi_002.png',
    新番副榜_3: './ranking/list4/bangumi_003.png',
    新番主榜: './ranking/pic/bangumitop10.png',
    主榜切换_3: './ranking/pic/_4.png',
    历史切换: './ranking/pic/history.png',
    历史记录: './ranking/pic/history_record.png',
    周刊Logo: './public/logo.png',
    本周结语: './ranking/pic/over.png',
    统计数据_1: './ranking/pic/stat_1.png',
    统计数据_2: './ranking/pic/stat_2.png',
    统计数据_3: './ranking/pic/stat_3.png',
    插入素材: './ranking/2_ed/addr2.png',
    EDCard: './ranking/2_ed/ed.png',
    主榜切换_4: './footage/EDBGM.png',
    ED封面: './ranking/2_ed/Cover.jpg',
    STAFF_名单: './ranking/2_ed/staff.png',
    视频失效: './public/invalid.png',
    1: './ranking/list2/001.png',
    2: './ranking/list2/002.png',
    3: './ranking/list2/003.png',
    4: './ranking/list2/004.png',
    5: './ranking/list2/005.png',
    6: './ranking/list2/006.png',
    7: './ranking/list2/007.png',
    8: './ranking/list2/008.png',
    9: './ranking/list2/009.png',
    10: './ranking/list2/010.png',
    11: './ranking/list2/011.png',
    12: './ranking/list2/012.png',
    13: './ranking/list2/013.png',
    14: './ranking/list2/014.png',
    15: './ranking/list2/015.png',
    16: './ranking/list2/016.png',
    17: './ranking/list2/017.png',
    18: './ranking/list2/018.png',
    19: './ranking/list2/019.png',
    20: './ranking/list2/020.png',
    21: './ranking/list2/021.png',
    22: './ranking/list2/022.png',
    23: './ranking/list2/023.png',
    24: './ranking/list2/024.png',
    25: './ranking/list2/025.png',
    26: './ranking/list2/026.png',
    27: './ranking/list2/027.png',
    28: './ranking/list2/028.png',
    29: './ranking/list2/029.png',
    30: './ranking/list2/030.png',
    // AUDIO
    NEXT_BGM: './public/av2313.mp3',
    主榜切换_BGM: './public/bilibili-mubox.wav',
    夏之随想_BGM: './public/Summer.mp3',
    Pickup_BGM: './public/a-3s-new.wav',
    影视国创_BGM: './ranking/list4/04.MIRACLE RUSH (inst.).mp3',
    新番副榜_BGM: './public/05 Zzz (Instrumental).mp3',
    历史数据_BGM: './public/1.mp3',
    哔哩哔哩_BGM: './public/bilibili.mp3',
    ED_BGM: './ranking/2_ed/ed.mp3',
    // VIDEO
    NotFound: './public/error.mp4',
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
        FileFullPath = Prefix + FileBaseName + '.mp4';
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
            FileFullPath = Prefix + FileBaseName + '_.png';
            FootageFile = new ImportOptions(File(FileFullPath));
            FootageFile.ImportAs = ImportAsType.FOOTAGE;
            FileItem = app.project.importFile(FootageFile);
            FileItem.name = RankDataList[n][key][0] + '_m';
            FileItem.parentFolder = WeeklyFolder;
        }
        FileFullPath = Prefix + FileBaseName + '.png';
        FootageFile = new ImportOptions(File(FileFullPath));
        FootageFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(FootageFile);
        FileItem.name = RankDataList[n][key][0] + '_';
        FileItem.parentFolder = WeeklyFolder;
    }
}

// ITEM INDEX
ResourceID = {};
for (n = 1; n <= app.project.items.length; n++) {
    ResourceID[app.project.items[n].name] = n;
}

// FUNCTION
function AddLayer(Target, Name, Duration, Offset) {
    NewLayer = Target.layers.add(app.project.items[ResourceID[Name]], Duration);
    NewLayer.startTime = Offset;
    return NewLayer;
}

function AddText(Target, text, justify, boxsize, position) {
    TLayer = Target.layers.addBoxText(boxsize);
    TDocument = TLayer.property('Source Text').value;
    TDocument.resetCharStyle();
    TDocument.resetParagraphStyle();
    TDocument.applyFill = true; // 填充颜色
    TDocument.applyStroke = false; // 描边颜色
    //TDocument.autoLeading = true; // 自动行距
    //TDocument.baselineShift = 0; // 基线偏移
    //TDocument.fillColor = color; // 填充颜色 [R/255, G/255, B/255]
    //TDocument.font = font; // 字体
    //TDocument.fontSize = fontsize; // 字号
    //TDocument.horizontalScale = 1; // 水平缩放
    TDocument.justification = justify; // 段落对齐
    //TDocument.leading = leading; // 行距
    TDocument.text = text; // 文本
    //TDocument.tracking = tracking; // 字间距
    //TDocument.tsume = tsume; // 字符压缩
    //TDocument.verticalScale = 1; // 垂直缩放
    TLayer.property('Position').setValue(position);
    TLayer.property('Source Text').setValue(TDocument);
    return TLayer;
}

function TextExpression(Font, Color, Size, Leading, Tracking) {
    return (
        'text.sourceText.createStyle().setFont("' +
        Font +
        '").setFillColor(hexToRgb("' +
        Color +
        '")).setFontSize(' +
        Size +
        ').setLeading(' +
        Leading +
        ').setTracking(' +
        Tracking +
        ');'
    );
}

function AddAudioProperty(Target, Ptype, Duration, Offset, Direction) {
    NewProperty = Target.property('Audio Levels');
    if (Ptype == 1) {
        // 1/4 circle
        if (Direction == 1) {
            // fade in
            for (t = Offset; t <= Offset + Duration; t += Duration / CompFPS) {
                NewProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow(1 - (t - Offset) / Duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow(1 - (t - Offset) / Duration, 2)) - 1) * 50,
                ]);
            }
            NewProperty.setValueAtTime(Offset, [-Infinity, -Infinity]);
        }
        if (Direction == 2) {
            // fade out
            for (t = Offset; t <= Offset + Duration; t += Duration / CompFPS) {
                NewProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow((t - Offset) / Duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow((t - Offset) / Duration, 2)) - 1) * 50,
                ]);
            }
            NewProperty.setValueAtTime(Offset + Duration, [-Infinity, -Infinity]);
        }
    }
    if (Ptype == 2) {
        // sin
        if (Direction == 1) {
            // fade in
            for (t = Offset; t <= Offset + Duration; t += Duration / CompFPS) {
                NewProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - Offset)) / Duration) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - Offset)) / Duration) + 1) / 2) * -50,
                ]);
            }
            NewProperty.setValueAtTime(Offset, [-Infinity, -Infinity]);
        }
        if (Direction == 2) {
            // fade out
            for (t = Offset; t <= Offset + Duration; t += Duration / CompFPS) {
                NewProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - Offset)) / Duration + Math.PI) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - Offset)) / Duration + Math.PI) + 1) / 2) * -50,
                ]);
            }
            NewProperty.setValueAtTime(Offset + Duration, [-Infinity, -Infinity]);
        }
    }
    return NewProperty;
}

function AddVideoProperty(Target, Ptype, Duration, Offset, Direction) {
    if (Ptype == 1) {
        // Opacity
        NewProperty = Target.property('Opacity');
        if (Direction == 1) {
            // fade in
            for (t = Offset; t <= Offset + Duration; t += Duration / CompFPS) {
                NewProperty.setValueAtTime(
                    t,
                    ((Math.cos((Math.PI * (t - Offset)) / Duration + Math.PI) + 1) / 2) * 100
                );
            }
            NewProperty.setValueAtTime(Offset + Duration, 100);
        }
        if (Direction == 2) {
            // fade out
            for (t = Offset; t <= Offset + Duration; t += Duration / CompFPS) {
                NewProperty.setValueAtTime(t, ((Math.cos((Math.PI * (t - Offset)) / Duration) + 1) / 2) * 100);
            }
            NewProperty.setValueAtTime(Offset + Duration, 0);
        }
    }
    if (Ptype == 2) {
        NewProperty = Target.property('Effects').addProperty('ADBE Linear Wipe');
        if (Direction == 1) {
            // fade in
            // Transition Completion
            NewProperty.property('ADBE Linear Wipe-0001').setValueAtTime(Offset, 100);
            NewProperty.property('ADBE Linear Wipe-0001').setValueAtTime(Offset + Duration, 0);

            // Transition Angle
            NewProperty.property('ADBE Linear Wipe-0002').setValueAtTime(Offset, 315);
            NewProperty.property('ADBE Linear Wipe-0002').setValueAtTime(Offset + Duration, 315);

            // Feather
            NewProperty.property('ADBE Linear Wipe-0003').setValue(50);
        }
        if (Direction == 2) {
            // fade out
            NewProperty.property('ADBE Linear Wipe-0001').setValueAtTime(Offset, 0);
            NewProperty.property('ADBE Linear Wipe-0001').setValueAtTime(Offset + Duration, 100);
            NewProperty.property('ADBE Linear Wipe-0002').setValueAtTime(Offset, 135);
            NewProperty.property('ADBE Linear Wipe-0002').setValueAtTime(Offset + Duration, 135);
            NewProperty.property('ADBE Linear Wipe-0003').setValue(50);
        }
    }
    return NewProperty;
}

function AddRankPart(Target, RankData, FirstRank, AddNEXT, AddProperty, Offset, IsTop) {
    SortRank = [];
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
        IsInvalid = false;
        for (key in LostVideos) {
            if (RankData[LastRank - i][0] == LostVideos[key]) {
                IsInvalid = true;
            }
        }
        VideoFile = (IsInvalid == false) ? RankData[LastRank - i][0] : 'NotFound';
        VideoMask = RankData[LastRank - i][0] + '_';
        TopImage = RankData[LastRank - i][0] + '_m';
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
        NewVideoLayer.property('Position').setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);

        // Add 16s
        if (IsInvalid == true) {
            VideoOffset = 0;
            InvalidLayer = AddLayer(Target, '视频失效', VideoDuration, Offset);
            // InvalidLayer.audioEnabled = false;
            InvalidLayer.inPoint = Offset;
            InvalidLayer.outPoint = Offset + VideoDuration;
            InvalidLayer.property('Position').setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
            OrigSize = InvalidLayer.sourceRectAtTime(InvalidLayer.inPoint, false);
            InvalidLayer.property('Scale').setValue([
                (PartSize[0] / OrigSize.width) * 100,
                (PartSize[0] / OrigSize.width) * 100,
            ]);
            if (IsTop || AddProperty) {
                InvalidLayer.property('Position').setValue([CompSize[0] / 2, CompSize[1] / 2]);
                InvalidLayer.property('Scale').setValue([100, 100]);
                AddVideoProperty(InvalidLayer, 1, 0.6, InvalidLayer.inPoint, 1);
                AddVideoProperty(InvalidLayer, 1, 0.6, InvalidLayer.outPoint - 0.6, 2);
            }
        }

        // Change Size & Add Logo
        if (IsTop) {
            AddVideoProperty(NewVideoLayer, 1, 3, NewVideoLayer.outPoint - 3, 2);
            AddAudioProperty(NewVideoLayer, 2, 1, NewVideoLayer.inPoint, 1);
            AddAudioProperty(NewVideoLayer, 2, 3, NewVideoLayer.outPoint - 3, 2);
            NewVideoLayer.property('Position').setValue([CompSize[0] / 2, CompSize[1] / 2]);
            PartSize = CompSize;
            LogoLayer = AddLayer(Target, '周刊Logo', VideoDuration + 0.2, Offset);
            LogoLayer.property('Scale').setValue([(CompSize[0] / 640) * 100, (CompSize[1] / 384) * 100]);
            LogoLayer.property('Position').setValue([CompSize[0] / 2, CompSize[1] / 2]);
            AddVideoProperty(LogoLayer, 1, 0.6, NewVideoLayer.outPoint - 0.6, 2);
        } else if (AddProperty) {
            AddVideoProperty(NewVideoLayer, 1, 0.6, NewVideoLayer.inPoint, 1);
            AddVideoProperty(NewVideoLayer, 1, 0.6, NewVideoLayer.outPoint - 0.6, 2);
            AddAudioProperty(NewVideoLayer, 1, 1, NewVideoLayer.inPoint, 1);
            AddAudioProperty(NewVideoLayer, 1, 1, NewVideoLayer.outPoint - 1, 2);
        } else {
            AddAudioProperty(NewVideoLayer, 1, 1, NewVideoLayer.inPoint, 1);
            AddAudioProperty(NewVideoLayer, 1, 1, NewVideoLayer.outPoint - 1, 2);
        }
        OrigSize = NewVideoLayer.sourceRectAtTime(NewVideoLayer.inPoint, false);
        if (OrigSize.width / OrigSize.height >= 16 / 9) {
            NewVideoLayer.property('Scale').setValue([
                (PartSize[0] / OrigSize.width) * 100,
                (PartSize[0] / OrigSize.width) * 100,
            ]);
        } else {
            NewVideoLayer.property('Scale').setValue([
                (PartSize[1] / OrigSize.height) * 100,
                (PartSize[1] / OrigSize.height) * 100,
            ]);
        }

        // Extra Step For Top 3
        if (IsTop) {
            BlackLayer = Target.layers.addSolid([0, 0, 0], '黑底', CompSize[0], CompSize[1], 1, 12);
            BlackLayer.inPoint = Offset - VideoOffset;
            NewVideoLayerS = AddLayer(Target, VideoFile, 12, Offset - VideoOffset);
            NewVideoLayerS.audioEnabled = false;
            NewVideoLayerS.inPoint = NewVideoLayer.inPoint;
            NewVideoLayerS.outPoint = NewVideoLayer.inPoint + 12;
            OrigSize = NewVideoLayerS.sourceRectAtTime(NewVideoLayerS.inPoint, false);
            if (OrigSize.width / OrigSize.height >= 16 / 9) {
                NewVideoLayerS.property('Scale').setValue([
                    (RankSize[0] / OrigSize.width) * 100,
                    (RankSize[0] / OrigSize.width) * 100,
                ]);
            } else {
                NewVideoLayerS.property('Scale').setValue([
                    (RankSize[1] / OrigSize.height) * 100,
                    (RankSize[1] / OrigSize.height) * 100,
                ]);
            }
            NewVideoLayerS.property('Position').setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
            if (IsInvalid == true) {
                VideoOffset = 0;
                InvalidLayerS = AddLayer(Target, '视频失效', VideoDuration, Offset);
                // InvalidLayerS.audioEnabled = false;
                InvalidLayerS.inPoint = Offset;
                InvalidLayerS.outPoint = InvalidLayerS.inPoint + 12;
                OrigSize = InvalidLayerS.sourceRectAtTime(InvalidLayerS.inPoint, false);
                InvalidLayerS.property('Scale').setValue([
                    (RankSize[0] / OrigSize.width) * 100,
                    (RankSize[0] / OrigSize.width) * 100,
                ]);
                InvalidLayerS.property('Position').setValue([CompSize[0] / 2 - 223, CompSize[1] / 2 - 118]);
            }
            BlueLayer = AddLayer(Target, '蓝底', 5.4, Offset - 0.4);
            AddVideoProperty(BlueLayer, 1, 0.4, Offset - 0.4, 1);
            AddLayer(Target, VideoMask, 7, Offset + 5);
            TopRankLayer = AddLayer(Target, TopImage, 5, Offset);
            AddVideoProperty(TopRankLayer, 1, 1, Offset, 1);
            Offset = Offset + VideoDuration + 0.2;
        } else {
            NewVideoLayer_mask = AddLayer(Target, VideoMask, VideoDuration, Offset);
            if (AddNEXT && LastRank - i > FirstRank) {
                NextBGMLayer = AddLayer(Target, 'NEXT_BGM', 1, Offset + VideoDuration);
                NextLayer = AddLayer(Target, 'NEXT', 1, Offset + VideoDuration);
                Offset = Offset + VideoDuration + 1;
            } else if (LastRank - i > FirstRank) {
                Offset = Offset + VideoDuration;
            } else {
                if (IsInvalid == true) {
                    AddVideoProperty(InvalidLayer, 1, 0.6, NewVideoLayer.outPoint - 0.6, 2);
                }
                AddVideoProperty(NewVideoLayer, 1, 0.6, NewVideoLayer.outPoint - 0.6, 2);
                AddVideoProperty(NewVideoLayer_mask, 1, 0.6, NewVideoLayer.outPoint - 0.6, 2);
                Offset = Offset + VideoDuration;
            }
        }
    }
    return Offset;
}

CompBlackLayer = FinalComp.layers.addSolid([0, 0, 0], '黑底', CompSize[0], CompSize[1], 1, 1);

// Part 1
AudioLayer_1 = AddLayer(Part_1, '夏之随想_BGM', 40.5, 0);
AddAudioProperty(AudioLayer_1, 1, 2.3, 38.2, 2);
BlankLayer_1 = AddLayer(Part_1, '蓝底', 40.5, 0);
TitleLayer_1 = AddLayer(Part_1, '标题', 4.5, 0);
AddVideoProperty(TitleLayer_1, 1, 0.6, 0, 1);
AddVideoProperty(TitleLayer_1, 1, 0.6, 3.9, 2);
WarnLayer_1 = AddLayer(Part_1, '注意事项_1', 2.3, 4.7);
AddVideoProperty(WarnLayer_1, 2, 0.3, 4.7, 1);
WarnLayer_2 = AddLayer(Part_1, '注意事项_2', 2.3, 7);
AddVideoProperty(WarnLayer_2, 2, 0.3, 9, 2);
BGMLayer = AddLayer(Part_1, '夏之随想', 5.5, 0.5);
AddVideoProperty(BGMLayer, 2, 2, 0, 1);
AddVideoProperty(BGMLayer, 2, 2, 4, 2);
WorldLayer = AddLayer(Part_1, '哔哩哔哩', 4.5, 9.5);
AddVideoProperty(WorldLayer, 1, 0.3, 9.5, 1);
AddVideoProperty(WorldLayer, 1, 0.3, 13.7, 2);
StartLayer = AddLayer(Part_1, '集计时间', 4.5, 14.3);
AddVideoProperty(StartLayer, 2, 0.3, 14.3, 1);
AddVideoProperty(StartLayer, 1, 0.3, 18.5, 2);
OpeningLayer = AddLayer(Part_1, 'Opening', 4.8, 19);
AddVideoProperty(OpeningLayer, 1, 0.5, 19, 1);
AddVideoProperty(OpeningLayer, 1, 0.5, 23.3, 2);
RuleLayer_1 = AddLayer(Part_1, '规则说明', 4.3, 24);
AddVideoProperty(RuleLayer_1, 2, 0.6, 24, 1);
RuleLayer_2 = AddLayer(Part_1, '特殊说明', 4.2, 28.3);
RuleLayer_3 = AddLayer(Part_1, '普通规则', 4, 32.5);
RuleLayer_4 = AddLayer(Part_1, '新番规则', 4, 36.5);
AddVideoProperty(RuleLayer_4, 2, 0.7, 39.8, 2);

AddLayer(FinalComp, Part_1.name, Part_1.duration, FinalComp.duration - FinalComp.duration);
FinalComp.duration = Part_1.duration;

// Part 2
AudioLayer_2 = AddLayer(Part_2, 'Pickup_BGM', 4, 0);
AddAudioProperty(AudioLayer_2, 1, 1, 0, 1);
AddAudioProperty(AudioLayer_2, 1, 1, 3, 2);
BlankLayer_2 = AddLayer(Part_2, '蓝底', 4, 0);
NextLayer_2 = AddLayer(Part_2, 'Pickup_切换', 4, 0);
AddVideoProperty(NextLayer_2, 2, 1, 0, 1);

// Part 3
Part_3.duration = AddRankPart(Part_3, RankDataList[0], 1, false, true, 0, false);

// Part 4
BlankLayer_4 = AddLayer(Part_4, '蓝底', 4, 0);
NextLayerAudio_4 = AddLayer(Part_4, '主榜切换_BGM', 4, 0);
AddAudioProperty(NextLayerAudio_4, 1, 1, 3, 2);
NextLayer_4 = AddLayer(Part_4, '主榜切换_1', 4, 0);
AddVideoProperty(NextLayer_4, 2, 1, 0, 1);

// Part 5 (30+ to 21)
Part_5.duration = AddRankPart(Part_5, RankDataList[1], 21, true, false, 0, false);

// Part 6 (tv & bangumi)
BlankLayer_6 = AddLayer(Part_6, '棕底', 56.6, 0);
AudioLayer_6 = AddLayer(Part_6, '影视国创_BGM', 56.6, 0 - 30);
AudioLayer_6.inPoint = 0;
AudioLayer_6.outPoint = 56.6;
AddAudioProperty(AudioLayer_6, 1, 1.8, AudioLayer_6.inPoint, 1);
AddAudioProperty(AudioLayer_6, 1, 3.2, AudioLayer_6.outPoint - 3.2, 2);
FilmLayer = AddLayer(Part_6, '影视切换', 3.73, 0);
AddVideoProperty(FilmLayer, 2, 0.5, 0, 1);
AddVideoProperty(FilmLayer, 2, 0.5, 3.23, 2);
RankLayer_6_1 = AddLayer(Part_6, '影视副榜_1', 7.6, 4);
AddVideoProperty(RankLayer_6_1, 2, 0.5, 4, 1);
RankLayer_6_2 = AddLayer(Part_6, '影视副榜_2', 7, 11.6);
RankLayer_6_3 = AddLayer(Part_6, '影视副榜_3', 7, 18.6);
AddVideoProperty(RankLayer_6_3, 2, 0.6, 25, 2);
RankLayer_6_cn_sub = AddLayer(Part_6, '国创副榜', 3.6, 26);
AddVideoProperty(RankLayer_6_cn_sub, 2, 0.5, 26, 1);
AddVideoProperty(RankLayer_6_cn_sub, 2, 0.5, 29.1, 2);
RankLayer_6_bgm_4 = AddLayer(Part_6, '国创副榜_1', 7.5, 30);
AddVideoProperty(RankLayer_6_bgm_4, 2, 0.5, 30, 1);
RankLayer_6_bgm_5 = AddLayer(Part_6, '国创副榜_2', 7.5, 37.5);
// AddVideoProperty(RankLayer_6_bgm_5, 2, 0.5, 44.5, 1);
RankLayer_6_bgm_6 = AddLayer(Part_6, '国创副榜_3', 8.4, 45);
AddVideoProperty(RankLayer_6_bgm_6, 2, 0.5, 52, 2);
RankLayer_6_cn_main = AddLayer(Part_6, '国创切换', 3.7, 52.9);
AddVideoProperty(RankLayer_6_cn_main, 2, 0.6, 52.9, 1);

// Part 7 (tv & bangumi)
Part_7.duration = AddRankPart(Part_7, RankDataList[2], 1, false, false, 0, false);

// Part 8
BlankLayer_8 = AddLayer(Part_8, '蓝底', 4, 0);
NextLayerAudio_8 = AddLayer(Part_8, '主榜切换_BGM', 4, 0);
AddAudioProperty(NextLayerAudio_8, 1, 1, 3, 2);
NextLayer_8 = AddLayer(Part_8, '主榜切换_2', 4, 0);
AddVideoProperty(NextLayer_8, 2, 1, 0, 1);

// Part 9 (20 to 11)
Part_9.duration = AddRankPart(Part_9, RankDataList[3], 11, true, false, 0, false);

// Part 10 (bangumi)
BlankLayer_10 = AddLayer(Part_10, '棕底', 33, 0);
AudioLayer_10 = AddLayer(Part_10, '新番副榜_BGM', 33, 0 - 4.3);
AudioLayer_10.inPoint = 0;
AudioLayer_10.outPoint = 33;
AddAudioProperty(AudioLayer_10, 1, 1.73, AudioLayer_10.inPoint, 1);
AddAudioProperty(AudioLayer_10, 1, 3, AudioLayer_10.outPoint - 3, 2);
BangumiLayer = AddLayer(Part_10, '新番切换', 5, 0);
AddVideoProperty(BangumiLayer, 2, 0.5, 0, 1);
AddVideoProperty(BangumiLayer, 2, 0.5, 4.5, 2);
BangumiLayer_1 = AddLayer(Part_10, '新番副榜_1', 7, 5.3);
AddVideoProperty(BangumiLayer_1, 2, 0.5, 5.3, 1);
BangumiLayer_2 = AddLayer(Part_10, '新番副榜_2', 7, 12.3);
BangumiLayer_3 = AddLayer(Part_10, '新番副榜_3', 7, 19.3);
AddVideoProperty(BangumiLayer_3, 2, 0.5, 25.8, 2);
BangumiTopLayer = AddLayer(Part_10, '新番主榜', 6.4, 26.6);
AddVideoProperty(BangumiTopLayer, 1, 1, 26.6, 1);

// Part 11 (bangumi)
Part_11.duration = AddRankPart(Part_11, RankDataList[4], 1, false, false, 0, false);

// Part 12
BlankLayer_12 = AddLayer(Part_12, '蓝底', 4, 0);
NextLayerAudio_12 = AddLayer(Part_12, '主榜切换_BGM', 4, 0);
AddAudioProperty(NextLayerAudio_12, 1, 1, 3, 2);
NextLayer_12 = AddLayer(Part_12, '主榜切换_3', 4, 0);
AddVideoProperty(NextLayer_12, 2, 1, 0, 1);

// Part 13 (10 to 4)
Part_13.duration = AddRankPart(Part_13, RankDataList[5], 4, true, false, 0, false);

// Part 14
BlankLayer_14 = AddLayer(Part_14, '棕底', 14.4, 0);
AudioLayer_14 = AddLayer(Part_14, '历史数据_BGM', 14.4, 0);
AudioLayer_14.inPoint = 0;
AudioLayer_14.outPoint = 14.4;
AddAudioProperty(AudioLayer_14, 1, 1, AudioLayer_14.outPoint - 1, 2);
RecordLayer = AddLayer(Part_14, '历史记录', 7.2, 0.2);
AddVideoProperty(RecordLayer, 1, 0.5, 0.2, 1);
AddVideoProperty(RecordLayer, 1, 0.5, 6.9, 2);
HistoryLayer = AddLayer(Part_14, '历史切换', 6.5, 7.9);
AddVideoProperty(HistoryLayer, 1, 0.5, 7.9, 1);

// Part 15 (history)
Part_15.duration = AddRankPart(Part_15, RankDataList[6], 1, false, false, 0, false);

// Part 16 (3 to 1)
Part_16.duration = AddRankPart(Part_16, RankDataList[7], 1, false, false, 0, true);

// Part 17
BlankLayer_17 = AddLayer(Part_17, '棕底', 25, 0);
AddVideoProperty(BlankLayer_17, 1, 0.5, 24.5, 2);
bilibili_layer = AddLayer(Part_17, '哔哩哔哩_BGM', 25, 0);
bilibili_layer.inPoint = 0;
bilibili_layer.outPoint = 25;
AddAudioProperty(bilibili_layer, 1, 3, bilibili_layer.outPoint - 3, 2);
stat_1_layer = AddLayer(Part_17, '统计数据_1', 6, 0.4);
AddVideoProperty(stat_1_layer, 2, 0.6, 0.4, 1);
stat_2_layer = AddLayer(Part_17, '统计数据_2', 6, 6.4);
stat_3_layer = AddLayer(Part_17, '统计数据_3', 6, 12.4);
AddVideoProperty(stat_3_layer, 2, 0.6, 17.8, 2);
over_layer = AddLayer(Part_17, '本周结语', 6.5, 18.5);
AddVideoProperty(over_layer, 2, 0.5, 18.5, 1);
AddVideoProperty(over_layer, 2, 0.5, 24.3, 2);

// Part 18 (30+ to 150 +)
AudioLayer_18 = AddLayer(Part_18, 'ED_BGM', null, 0);
EDAudioLength = app.project.items[ResourceID.ED_BGM].duration;
AudioLayer_18.inPoint = 0;
AudioLayer_18.outPoint = EDAudioLength;

//BlankLayer_18 = AddLayer(Part_18, '蓝底', 5, 1);
BlankLayer_18 = AddLayer(Part_18, '棕底', EDAudioLength - 9, 9);
AddVideoProperty(BlankLayer_18, 1, 1, EDAudioLength - 1, 2);
AddAudioProperty(AudioLayer_18, 1, 0.6, 0, 1);
AddAudioProperty(AudioLayer_18, 1, 1, EDAudioLength - 1, 2);
SubRankLength = (EDAudioLength - 19.5) / 30;
for (i = 1; i < 30; i++) {
    AddLayer(Part_18, i, SubRankLength, 9 + (i - 1) * SubRankLength);
}
LastRankCardLayer = AddLayer(Part_18, i, SubRankLength, 9 + SubRankLength * 29);
AddVideoProperty(LastRankCardLayer, 1, 0.6, 9 + SubRankLength * 30 - 0.6, 2);
StaffLayer = AddLayer(Part_18, 'STAFF_名单', 4.6, 0);
AddVideoProperty(StaffLayer, 1, 0.6, 0, 1);
AddVideoProperty(StaffLayer, 1, 0.6, 4, 2);
AlbumLayer = AddLayer(Part_18, 'ED封面', 5.9, 4);
AlbumLayer.property('Position').setValue([170, 926]);
OrigSize = AlbumLayer.sourceRectAtTime(AlbumLayer.inPoint, false);
if (OrigSize.width / OrigSize.height <= 1) {
    AlbumLayer.property('Scale').setValue([
        (AlbumSize[0] / OrigSize.width) * 100,
        (AlbumSize[0] / OrigSize.width) * 100,
    ]);
} else {
    AlbumLayer.property('Scale').setValue([
        (AlbumSize[1] / OrigSize.height) * 100,
        (AlbumSize[1] / OrigSize.height) * 100,
    ]);
}
NextLayer_18 = AddLayer(Part_18, '主榜切换_4', 5.9, 4);
SortRank = [];
for (key in RankDataList[1]) {
    SortRank[SortRank.length] = key;
}
LastRank = Math.max.apply(Math, SortRank);
SubRankText = AddText(Part_18, (LastRank + 1) + '-' + (LastRank + 120), ParagraphJustification.CENTER_JUSTIFY, [700, 226], [605, 523]);
SubRankText.startTime = 4;
SubRankText.outPoint = 4 + 5.9;
SubRankText.property('Source Text').expression = TextExpression('HYm2gj', 'FFFFFF', 216, 108, 0);
SubRankText.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.width/2+s.left, s.height/2+s.top];';
file = new File('./ranking/2_ed/' + WEEK_NUM + '.txt');
file.open('r');
content = file.read();
file.close();
EDInfoText = AddText(Part_18, content, ParagraphJustification.LEFT_JUSTIFY, [1640, 140], [290, 860]);
EDInfoText.startTime = 4;
EDInfoText.outPoint = 4 + 5.9;
EDInfoText.property('Source Text').expression = 'text.sourceText.createStyle().setFont("FZY3K--GBK1-0").setFillColor(hexToRgb("FFFFFF")).setFontSize(30).setLeading(48).setTracking(100).setFauxBold(true);';
EDInfoText.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';

AddVideoProperty(AlbumLayer, 1, 0.6, 4, 1);
AddVideoProperty(AlbumLayer, 1, 0.6, 9.3, 2);
AddVideoProperty(NextLayer_18, 1, 0.6, 4, 1);
AddVideoProperty(NextLayer_18, 1, 0.6, 9.3, 2);
AddVideoProperty(SubRankText, 1, 0.6, 4, 1);
AddVideoProperty(SubRankText, 1, 0.6, 9.3, 2);
AddVideoProperty(EDInfoText, 1, 0.6, 4, 1);
AddVideoProperty(EDInfoText, 1, 0.6, 9.3, 2);
AddrLayer = AddLayer(Part_18, '插入素材', 5, EDAudioLength - 10);
AddVideoProperty(AddrLayer, 1, 0.6, EDAudioLength - 10, 1);
AddVideoProperty(AddrLayer, 1, 0.6, EDAudioLength - 5.6, 2);
EdCardLayer = AddLayer(Part_18, 'EDCard', 5, EDAudioLength - 5);
AddVideoProperty(EdCardLayer, 1, 0.6, EDAudioLength - 5, 1);
AddVideoProperty(EdCardLayer, 1, 1, EDAudioLength - 1, 2);
Part_18.duration = EDAudioLength + 0.1;

Comps = [
    Part_1,
    Part_2,
    Part_3,
    Part_4,
    Part_5,
    Part_6,
    Part_7,
    Part_8,
    Part_9,
    Part_10,
    Part_11,
    Part_12,
    Part_13,
    Part_14,
    Part_15,
    Part_16,
    Part_17,
    Part_18,
];
for (n = 1; n < Comps.length; n++) {
    AddLayer(FinalComp, Comps[n].name, Comps[n].duration, FinalComp.duration);
    FinalComp.duration += Comps[n].duration;
}
CompBlackLayer.outPoint = FinalComp.duration;
FinalComp.openInViewer();

AddLayer(CoverComp1, '投稿封面_1', 25, 0);
AddLayer(CoverComp1, '投稿封面_2', 25, 0);
AddLayer(CoverComp1, '投稿封面_3', 25, 0);
AnniversaryLayer = AddText(CoverComp1, 'The 15th year', ParagraphJustification.LEFT_JUSTIFY, [540, 100], [128, 384]);
AnniversaryLayer.property('Source Text').expression = TextExpression('HYQiHei-AZEJ', 'FFFFFF', 64, 60, 60);
AnniversaryLayer.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
AnniversaryLayer.applyPreset(new File('DropShadow.ffx'));
AnniversaryLayer.enabled = false;
WEEKLayer = AddText(CoverComp1, '#' + WEEK_NUM, ParagraphJustification.LEFT_JUSTIFY, [440, 140], [134, 254]);
WEEKLayer.property('Source Text').expression = TextExpression('HYQiHei-AZEJ', 'FFFFFF', 122, 60, 100);
WEEKLayer.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
WEEKLayer.applyPreset(new File('DropShadow.ffx'));
CoverComp1.openInViewer();

AddLayer(CoverComp2, '投稿封面_1', 25, 0);
AddLayer(CoverComp2, '投稿封面_2', 25, 0);
AddLayer(CoverComp2, '投稿封面_3', 25, 0);
AnniversaryLayer = AddText(CoverComp2, 'The 15th year', ParagraphJustification.LEFT_JUSTIFY, [540, 100], [48, 428]);
AnniversaryLayer.property('Source Text').expression = TextExpression('HYQiHei-AZEJ', 'FFFFFF', 64, 60, 60);
AnniversaryLayer.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
AnniversaryLayer.applyPreset(new File('DropShadow.ffx'));
AnniversaryLayer.enabled = false;
WEEKLayer = AddText(CoverComp2, '#' + WEEK_NUM, ParagraphJustification.LEFT_JUSTIFY, [440, 140], [54, 298]);
WEEKLayer.property('Source Text').expression = TextExpression('HYQiHei-AZEJ', 'FFFFFF', 122, 60, 100);
WEEKLayer.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
WEEKLayer.applyPreset(new File('DropShadow.ffx'));
CoverComp2.openInViewer();

renderQueue = app.project.renderQueue;
render = renderQueue.items.add(CoverComp1);
render.outputModules[1].applyTemplate('Cover');
render.outputModules[1].file = new File('./封面_169_[#].jpg');
render = renderQueue.items.add(CoverComp2);
render.outputModules[1].applyTemplate('Cover');
render.outputModules[1].file = new File('./封面_43_[#].jpg');
render = renderQueue.items.add(FinalComp);
render.outputModules[1].applyTemplate('Voukoder');
render.outputModules[1].file = new File('./周刊哔哩哔哩排行榜#' + WEEK_NUM + '.mp4');

app.project.save(new File('./bilibilirank_' + WEEK_NUM + '.aep'));

Stamp = [];
for (n = 0; n < Comps.length; n++) {
    Stamp.push(Comps[n].duration);
}

function SumStamp(Part) {
    return Math.ceil(eval(Stamp.slice(0, Part).join('+'))) + 1;
}

TimeLine = [
    { 'from': 0, 'to': SumStamp(1), 'content': 'OP' },
    { 'from': SumStamp(1), 'to': SumStamp(3), 'content': 'Pickup' },
    { 'from': SumStamp(3), 'to': SumStamp(5), 'content': '21-30+' },
    { 'from': SumStamp(5), 'to': SumStamp(7), 'content': '影视&国创' },
    { 'from': SumStamp(7), 'to': SumStamp(9), 'content': '11-20' },
    { 'from': SumStamp(9), 'to': SumStamp(11), 'content': '番剧' },
    { 'from': SumStamp(11), 'to': SumStamp(13), 'content': '4-10' },
    { 'from': SumStamp(13), 'to': SumStamp(15), 'content': '历史' },
    { 'from': SumStamp(15), 'to': SumStamp(16), 'content': '1-3' },
    { 'from': SumStamp(16), 'to': SumStamp(18), 'content': 'ED' },
];
doc = new File('./stamp.json');
doc.open('w');
doc.write(JSON.stringify(TimeLine));
doc.close();