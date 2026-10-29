// @include 'json2/json2.js';
app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
YUME = 1277009809;
WEEK_NUM = Math.floor((Date.now() / 1000 - YUME + 133009) / 3600 / 24 / 7);
BANGUMI = false;

compFPS = 60;
compSize = [1920, 1080];
rankVideoSize = [1440, 810];
albumCoverSize = [188, 188];
fileFolder = './ranking/#' + WEEK_NUM + '/main/';
rankYamlRegex =
    /- :rank: (\d+)\n {2}:name: (\w+)\n {2}:length: (\d+)\n {2}:offset: (\d+)(\n {2}:short: \d+)?(\n {2}:no_pause: true)?/gm;
rankDataGroup = '"$1": ["$2", $3, $4],';
rankDataPart = [3, 5, 7, 9, 11, 13, 15, 16];
lostfile = new File('./footage/LostFile.json');
lostfile.open('r');
content = lostfile.read();
lostfile.close();
lostVideos = JSON.parse(content);
rankDataList = [];
for (n = 0; n < rankDataPart.length; n++) {
    file = new File(fileFolder + WEEK_NUM + '_' + rankDataPart[n] + '.yml');
    file.open('r');
    content = file.read();
    file.close();
    rankPartList = content.replace(rankYamlRegex, rankDataGroup).replace('\'', '"').replace('---', '{') + '}';
    rankPartList = rankPartList.replace(',\n}', '\n}');
    rankDataList[rankDataList.length] = JSON.parse(rankPartList);
}
app.newProject();
app.project.expressionEngine = 'javascript-1.0';
app.project.workingSpace = 'sRGB IEC61966-2.1';
app.project.bitsPerChannel = 8;
finalComp = app.project.items.addComp('周刊哔哩哔哩排行榜#' + WEEK_NUM, compSize[0], compSize[1], 1, 1, compFPS);
rankPart1 = app.project.items.addComp('rankPart1', compSize[0], compSize[1], 1, 40.5, compFPS);
rankPart2 = app.project.items.addComp('rankPart2', compSize[0], compSize[1], 1, 4, compFPS);
rankPart3 = app.project.items.addComp('rankPart3', compSize[0], compSize[1], 1, 60, compFPS);
rankPart4 = app.project.items.addComp('rankPart4', compSize[0], compSize[1], 1, 4, compFPS);
rankPart5 = app.project.items.addComp('rankPart5', compSize[0], compSize[1], 1, 60, compFPS);
rankPart6 = app.project.items.addComp('rankPart6', compSize[0], compSize[1], 1, 56.6, compFPS);
rankPart7 = app.project.items.addComp('rankPart7', compSize[0], compSize[1], 1, 60, compFPS);
rankPart8 = app.project.items.addComp('rankPart8', compSize[0], compSize[1], 1, 4, compFPS);
rankPart9 = app.project.items.addComp('rankPart9', compSize[0], compSize[1], 1, 60, compFPS);
rankPart10 = app.project.items.addComp('rankPart10', compSize[0], compSize[1], 1, 33, compFPS);
rankPart11 = app.project.items.addComp('rankPart11', compSize[0], compSize[1], 1, 60, compFPS);
rankPart12 = app.project.items.addComp('rankPart12', compSize[0], compSize[1], 1, 4, compFPS);
rankPart13 = app.project.items.addComp('rankPart13', compSize[0], compSize[1], 1, 60, compFPS);
rankPart14 = app.project.items.addComp('rankPart14', compSize[0], compSize[1], 1, 14.4, compFPS);
rankPart15 = app.project.items.addComp('rankPart15', compSize[0], compSize[1], 1, 60, compFPS);
rankPart16 = app.project.items.addComp('rankPart16', compSize[0], compSize[1], 1, 60, compFPS);
rankPart17 = app.project.items.addComp('rankPart17', compSize[0], compSize[1], 1, 25, compFPS);
rankPart18 = app.project.items.addComp('rankPart18', compSize[0], compSize[1], 1, 60, compFPS);
coverComp1 = app.project.items.addComp('封面_16-9', 1120, 630, 1, 1 / compFPS, compFPS);
coverComp2 = app.project.items.addComp('封面_4-3', 960, 720, 1, 1 / compFPS, compFPS);

staticFolder = app.project.items.addFolder('StaticFootage');
weeklyFolder = app.project.items.addFolder('WeeklyFootage');

staticFootage = {
    // IMAGE
    投稿封面_1: './footage/public/ANNIVERSARY.png',
    投稿封面_2: './footage/public/STANDARD.png',
    投稿封面_3: './footage/public/CHARA.png',
    蓝底: './footage/public/blank.png',
    棕底: './footage/public/bg_2.png',
    NEXT: './footage/public/change.png',
    夏之随想: './footage/public/bgm.png',
    注意事项_1: './footage/public/warn_1.png',
    注意事项_2: './footage/public/warn_2.png',
    Pickup_切换: './footage/public/_pickup.png',
    主榜切换_2: './footage/public/_3.png',
    主榜切换_3: './footage/public/_4.png',
    国创切换: './footage/public/guochuang_zhu.png',
    国创副榜: './footage/public/guochuang_fu.png',
    影视切换: './footage/public/film.png',
    新番切换: './footage/public/bangumi.png',
    新番主榜: './footage/public/bangumitop10.png',
    周刊Logo: './footage/public/logo.png',
    插入素材: './footage/public/addr2.png',
    EDCard: './footage/public/ed.png',
    主榜切换_4: './footage/public/EDBGM.png',
    STAFF_名单: './footage/public/staff.png',
    视频失效: './footage/public/invalid.png',
    规则说明: './footage/public/rule_1.png',
    普通规则: './footage/public/rule_3.png',
    新番规则: './footage/public/rule_4.png',
    主榜切换_1: './ranking/#' + WEEK_NUM + '/_1.png',
    历史切换: './ranking/#' + WEEK_NUM + '/history.png',
    特殊说明: './ranking/#' + WEEK_NUM + '/rule_2.png',
    标题: './ranking/#' + WEEK_NUM + '/title.png',
    集计时间: './ranking/#' + WEEK_NUM + '/start.png',
    Opening: './ranking/#' + WEEK_NUM + '/op_2.png',
    哔哩哔哩: './ranking/#' + WEEK_NUM + '/world.png',
    历史记录: './ranking/#' + WEEK_NUM + '/history_record.png',
    本周结语: './ranking/#' + WEEK_NUM + '/over.png',
    统计数据_1: './ranking/#' + WEEK_NUM + '/stat_1.png',
    统计数据_2: './ranking/#' + WEEK_NUM + '/stat_2.png',
    统计数据_3: './ranking/#' + WEEK_NUM + '/stat_3.png',
    ED封面: './ranking/#' + WEEK_NUM + '/Cover.jpg',
    影视副榜_1: './ranking/#' + WEEK_NUM + '/sub/tv_001.png',
    影视副榜_2: './ranking/#' + WEEK_NUM + '/sub/tv_002.png',
    影视副榜_3: './ranking/#' + WEEK_NUM + '/sub/tv_003.png',
    新番副榜_1: './ranking/#' + WEEK_NUM + '/sub/bangumi_001.png',
    新番副榜_2: './ranking/#' + WEEK_NUM + '/sub/bangumi_002.png',
    新番副榜_3: './ranking/#' + WEEK_NUM + '/sub/bangumi_003.png',
    国创副榜_1: './ranking/#' + WEEK_NUM + '/sub/bangumi_004.png',
    国创副榜_2: './ranking/#' + WEEK_NUM + '/sub/bangumi_005.png',
    国创副榜_3: './ranking/#' + WEEK_NUM + '/sub/bangumi_006.png',
    1: './ranking/#' + WEEK_NUM + '/sub/001.png',
    2: './ranking/#' + WEEK_NUM + '/sub/002.png',
    3: './ranking/#' + WEEK_NUM + '/sub/003.png',
    4: './ranking/#' + WEEK_NUM + '/sub/004.png',
    5: './ranking/#' + WEEK_NUM + '/sub/005.png',
    6: './ranking/#' + WEEK_NUM + '/sub/006.png',
    7: './ranking/#' + WEEK_NUM + '/sub/007.png',
    8: './ranking/#' + WEEK_NUM + '/sub/008.png',
    9: './ranking/#' + WEEK_NUM + '/sub/009.png',
    10: './ranking/#' + WEEK_NUM + '/sub/010.png',
    11: './ranking/#' + WEEK_NUM + '/sub/011.png',
    12: './ranking/#' + WEEK_NUM + '/sub/012.png',
    13: './ranking/#' + WEEK_NUM + '/sub/013.png',
    14: './ranking/#' + WEEK_NUM + '/sub/014.png',
    15: './ranking/#' + WEEK_NUM + '/sub/015.png',
    16: './ranking/#' + WEEK_NUM + '/sub/016.png',
    17: './ranking/#' + WEEK_NUM + '/sub/017.png',
    18: './ranking/#' + WEEK_NUM + '/sub/018.png',
    19: './ranking/#' + WEEK_NUM + '/sub/019.png',
    20: './ranking/#' + WEEK_NUM + '/sub/020.png',
    21: './ranking/#' + WEEK_NUM + '/sub/021.png',
    22: './ranking/#' + WEEK_NUM + '/sub/022.png',
    23: './ranking/#' + WEEK_NUM + '/sub/023.png',
    24: './ranking/#' + WEEK_NUM + '/sub/024.png',
    25: './ranking/#' + WEEK_NUM + '/sub/025.png',
    26: './ranking/#' + WEEK_NUM + '/sub/026.png',
    27: './ranking/#' + WEEK_NUM + '/sub/027.png',
    28: './ranking/#' + WEEK_NUM + '/sub/028.png',
    29: './ranking/#' + WEEK_NUM + '/sub/029.png',
    30: './ranking/#' + WEEK_NUM + '/sub/030.png',
    // AUDIO
    NEXT_BGM: './footage/audio/av2313.mp3',
    主榜切换_BGM: './footage/audio/bilibili-mubox.wav',
    夏之随想_BGM: './footage/audio/Summer.mp3',
    Pickup_BGM: './footage/audio/a-3s-new.wav',
    影视国创_BGM: './footage/audio/04.MIRACLE RUSH (inst.).mp3',
    新番副榜_BGM: './footage/audio/05 Zzz (Instrumental).mp3',
    历史数据_BGM: './footage/audio/1.mp3',
    哔哩哔哩_BGM: './footage/audio/bilibili.mp3',
    ED_BGM: './ranking/#' + WEEK_NUM + '/ed.mp3',
    // VIDEO
    NotFound: './footage/public/error.mp4'
};

for (key in staticFootage) {
    footageFile = new ImportOptions(File(staticFootage[key]));
    footageFile.ImportAs = ImportAsType.FOOTAGE;
    footageFileItem = app.project.importFile(footageFile);
    footageFileItem.pixelAspect = 1.0;
    footageFileItem.name = key;
    footageFileItem.parentFolder = staticFolder;
}

for (n = 0; n < rankDataList.length; n++) {
    // IMPORT VIDEO
    for (key in rankDataList[n]) {
        footageFileName = rankDataList[n][key][0];
        footageFileRank = parseInt(key) < 10 ? '0' + key : key;
        footageFilePath = fileFolder + footageFileRank + '_' + footageFileName + '.mp4';
        footageFile = new ImportOptions(File(footageFilePath));
        footageFile.ImportAs = ImportAsType.FOOTAGE;
        footageFileItem = app.project.importFile(footageFile);
        footageFileItem.pixelAspect = 1.0;
        footageFileItem.name = rankDataList[n][key][0];
        footageFileItem.parentFolder = weeklyFolder;
    }
    // IMPORT IMAGE
    for (key in rankDataList[n]) {
        footageFileName = rankDataList[n][key][0];
        footageFileRank = parseInt(key) < 10 ? '0' + key : key;
        if (n == 7) {
            footageFilePath = fileFolder + footageFileRank + '_' + footageFileName + '_.png';
            footageFile = new ImportOptions(File(footageFilePath));
            footageFile.ImportAs = ImportAsType.FOOTAGE;
            footageFileItem = app.project.importFile(footageFile);
            footageFileItem.pixelAspect = 1.0;
            footageFileItem.name = rankDataList[n][key][0] + '_m';
            footageFileItem.parentFolder = weeklyFolder;
        }
        footageFilePath = fileFolder + footageFileRank + '_' + footageFileName + '.png';
        footageFile = new ImportOptions(File(footageFilePath));
        footageFile.ImportAs = ImportAsType.FOOTAGE;
        footageFileItem = app.project.importFile(footageFile);
        footageFileItem.pixelAspect = 1.0;
        footageFileItem.name = rankDataList[n][key][0] + '_';
        footageFileItem.parentFolder = weeklyFolder;
    }
}

// ITEM INDEX
footageItemID = {};
function renewItemID() {
    for (n = 1; n <= app.project.items.length; n++) {
        footageItemID[app.project.items[n].name] = n;
    }
}
renewItemID();

// FUNCTION
function addCompLayer(target, name, duration, start) {
    newLayer = target.layers.add(app.project.items[footageItemID[name]], duration);
    newLayer.startTime = start;
    return newLayer;
}

function addTextLayer(target, text, justification, box, position) {
    newLayer = target.layers.addBoxText(box);
    textDocument = newLayer.property('Source Text').value;
    textDocument.resetCharStyle();
    textDocument.resetParagraphStyle();
    textDocument.applyFill = true; // 填充颜色
    textDocument.applyStroke = false; // 描边颜色
    //textDocument.autoLeading = true; // 自动行距
    //textDocument.baselineShift = 0; // 基线偏移
    //textDocument.fillColor = color; // 填充颜色 [R/255, G/255, B/255]
    //textDocument.font = font; // 字体
    //textDocument.fontSize = fontsize; // 字号
    //textDocument.horizontalScale = 1; // 水平缩放
    textDocument.justification = justification; // 段落对齐
    //textDocument.leading = leading; // 行距
    textDocument.text = text; // 文本
    //textDocument.tracking = tracking; // 字间距
    //textDocument.tsume = tsume; // 字符压缩
    //textDocument.verticalScale = 1; // 垂直缩放
    newLayer.property('Position').setValue(position);
    newLayer.property('Source Text').setValue(textDocument);
    return newLayer;
}

function textExpression(font, color, size, leading, tracking, content) {
    return (
        'text.sourceText.createStyle().setFont("' +
        font +
        '").setFillColor(hexToRgb("' +
        color +
        '")).setFontSize(' +
        size +
        ').setLeading(' +
        leading +
        ').setTracking(' +
        tracking +
        ').setText("' +
        content +
        '");'
    );
}

function addAudioProperty(target, pType, duration, offset, direction) {
    newProperty = target.property('Audio Levels');
    if (pType == 1) {
        // 1/4 circle
        if (direction == 1) {
            // fade in
            for (t = offset; t <= offset + duration; t += duration / compFPS) {
                newProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow(1 - (t - offset) / duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow(1 - (t - offset) / duration, 2)) - 1) * 50,
                ]);
            }
            newProperty.setValueAtTime(offset, [-Infinity, -Infinity]);
        }
        if (direction == 2) {
            // fade out
            for (t = offset; t <= offset + duration; t += duration / compFPS) {
                newProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow((t - offset) / duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow((t - offset) / duration, 2)) - 1) * 50,
                ]);
            }
            newProperty.setValueAtTime(offset + duration, [-Infinity, -Infinity]);
        }
    }
    if (pType == 2) {
        // sin
        if (direction == 1) {
            // fade in
            for (t = offset; t <= offset + duration; t += duration / compFPS) {
                newProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - offset)) / duration) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - offset)) / duration) + 1) / 2) * -50,
                ]);
            }
            newProperty.setValueAtTime(offset, [-Infinity, -Infinity]);
        }
        if (direction == 2) {
            // fade out
            for (t = offset; t <= offset + duration; t += duration / compFPS) {
                newProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - offset)) / duration + Math.PI) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - offset)) / duration + Math.PI) + 1) / 2) * -50,
                ]);
            }
            newProperty.setValueAtTime(offset + duration, [-Infinity, -Infinity]);
        }
    }
    return newProperty;
}

function addVideoProperty(target, pType, duration, offset, direction) {
    if (pType == 1) {
        // Opacity
        newProperty = target.property('Opacity');
        if (direction == 1) {
            // fade in
            for (t = offset; t <= offset + duration; t += duration / compFPS) {
                newProperty.setValueAtTime(
                    t,
                    ((Math.cos((Math.PI * (t - offset)) / duration + Math.PI) + 1) / 2) * 100
                );
            }
            newProperty.setValueAtTime(offset + duration, 100);
        }
        if (direction == 2) {
            // fade out
            for (t = offset; t <= offset + duration; t += duration / compFPS) {
                newProperty.setValueAtTime(t, ((Math.cos((Math.PI * (t - offset)) / duration) + 1) / 2) * 100);
            }
            newProperty.setValueAtTime(offset + duration, 0);
        }
    }
    if (pType == 2) {
        newProperty = target.property('Effects').addProperty('ADBE Linear Wipe');
        if (direction == 1) {
            // fade in
            // Transition Completion
            newProperty.property('ADBE Linear Wipe-0001').setValueAtTime(offset, 100);
            newProperty.property('ADBE Linear Wipe-0001').setValueAtTime(offset + duration, 0);

            // Transition Angle
            newProperty.property('ADBE Linear Wipe-0002').setValueAtTime(offset, 315);
            newProperty.property('ADBE Linear Wipe-0002').setValueAtTime(offset + duration, 315);

            // Feather
            newProperty.property('ADBE Linear Wipe-0003').setValue(50);
        }
        if (direction == 2) {
            // fade out
            newProperty.property('ADBE Linear Wipe-0001').setValueAtTime(offset, 0);
            newProperty.property('ADBE Linear Wipe-0001').setValueAtTime(offset + duration, 100);
            newProperty.property('ADBE Linear Wipe-0002').setValueAtTime(offset, 135);
            newProperty.property('ADBE Linear Wipe-0002').setValueAtTime(offset + duration, 135);
            newProperty.property('ADBE Linear Wipe-0003').setValue(50);
        }
    }
    return newProperty;
}

function addRankPart(target, rankPartData, needNext, needProperty, partOffset, isTop) {
    sortedRank = [];
    rankPartSize = rankVideoSize;
    for (key in rankPartData) {
        sortedRank[sortedRank.length] = key;
    }
    lastRankNum = Math.max.apply(Math, sortedRank);
    firstRankNum = Math.min.apply(Math, sortedRank);
    for (i = 0; lastRankNum - i >= firstRankNum; i++) {
        if (!(lastRankNum - i in rankPartData)) {
            continue;
        }
        isInvalid = false;
        for (key in lostVideos) {
            if (rankPartData[lastRankNum - i][0] == key) {
                isInvalid = true;
            }
        }
        partVideoFile = (isInvalid == false) ? rankPartData[lastRankNum - i][0] : 'NotFound';
        partVideoMask = rankPartData[lastRankNum - i][0] + '_';
        partTopImg = rankPartData[lastRankNum - i][0] + '_m';
        partVideoDuration = rankPartData[lastRankNum - i][1];
        partTrueDuration = app.project.items[footageItemID[partVideoFile]].duration;
        if (partTrueDuration < partVideoDuration) {
            partVideoDuration = partTrueDuration;
        }
        // VideoOffset = rankPartData[lastRankNum - i][2];
        videoOffset = 0;
        subtitle = new File(fileFolder + partVideoFile + '.json');
        hasSubtitle = subtitle.exists;
        if (!hasSubtitle) {
            newPartVideo = addCompLayer(target, partVideoFile, partVideoDuration, partOffset - videoOffset);
        } else {
            subtitle.open('r');
            content = subtitle.read();
            subtitle.close();
            subtitleList = JSON.parse(content).body;
            videoWithSub = app.project.items.addComp(partVideoFile + '_Subtitle', compSize[0], compSize[1], 1, partTrueDuration, compFPS);
            videoWithSub.hideShyLayers = true;
            videoWithSub.parentFolder = weeklyFolder;
            renewItemID();
            newPartVideo = addCompLayer(videoWithSub, partVideoFile, partTrueDuration, 0);
            for (n = 0; n < subtitleList.length; n++) {
                if (
                    (subtitleList[n].from < rankPartData[lastRankNum - i][2] && subtitleList[n].to <= rankPartData[lastRankNum - i][2]) ||
                    (subtitleList[n].from >= rankPartData[lastRankNum - i][2] + partTrueDuration && subtitleList[n].to > rankPartData[lastRankNum - i][2] + partTrueDuration)
                ) {
                    continue;
                } else {
                    compBase = videoWithSub.layers.addSolid([0, 0, 0], '黑底', compSize[0], compSize[1], 1, 1);
                    compBase.startTime = 0 - rankPartData[lastRankNum - i][2];
                    compBase.inPoint = compBase.startTime + subtitleList[n].from;
                    compBase.outPoint = compBase.startTime + subtitleList[n].to;
                    subtitleText = addTextLayer(videoWithSub, subtitleList[n].content, ParagraphJustification.CENTER_JUSTIFY, [compSize[0], 120], [compSize[0] / 2, compSize[1] - 2 * 52]);
                    subtitleText.startTime = compBase.startTime;
                    subtitleText.inPoint = compBase.inPoint;
                    subtitleText.outPoint = compBase.outPoint;
                    subtitleText.property('Source Text').expression = textExpression('Microsoft YaHei', '#FFFFFF', 52, 52, 52, subtitleList[n].content.replace('\n', '\\n'));
                    subtitleText.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.width/2+s.left, s.height/2+s.top];';
                    compBase.property('Position').expression = 'thisComp.layer(thisLayer.index-1).transform.position;';
                    compBase.property('Scale').expression = 's=thisComp.layer(thisLayer.index-1).sourceRectAtTime();transform.scale=[(s.width+30)*100/thisLayer.width,(s.height+30)*100/thisLayer.height];';
                    compBase.property('Opacity').setValue(50);
                    compBase.shy = true;
                }
            }
            newPartVideo = addCompLayer(target, partVideoFile + '_Subtitle', partVideoDuration, partOffset - videoOffset);
        }
        newPartVideo.inPoint = partOffset;
        newPartVideo.outPoint = partOffset + partVideoDuration;
        newPartVideo.inPoint = newPartVideo.outPoint - partVideoDuration;
        newPartVideo.outPoint = newPartVideo.inPoint + partVideoDuration;
        newPartVideo.property('Position').setValue([compSize[0] / 2 - 223, compSize[1] / 2 - 118]);

        // Add 16s
        if (isInvalid) {
            videoOffset = 0;
            invalidText = addCompLayer(target, '视频失效', partVideoDuration, partOffset);
            // invalidText.audioEnabled = false;
            invalidText.inPoint = partOffset;
            invalidText.outPoint = partOffset + partVideoDuration;
            invalidText.property('Position').setValue([compSize[0] / 2 - 223, compSize[1] / 2 - 118]);
            origLayerSize = invalidText.sourceRectAtTime(invalidText.inPoint, false);
            invalidText.property('Scale').setValue([
                (rankPartSize[0] / origLayerSize.width) * 100,
                (rankPartSize[0] / origLayerSize.width) * 100,
            ]);
            if (isTop || needProperty) {
                invalidText.property('Position').setValue([compSize[0] / 2, compSize[1] / 2]);
                invalidText.property('Scale').setValue([100, 100]);
                addVideoProperty(invalidText, 1, 0.6, invalidText.inPoint, 1);
                addVideoProperty(invalidText, 1, 0.6, invalidText.outPoint - 0.6, 2);
            }
        }

        // Change Size & Add Logo
        if (isTop) {
            addVideoProperty(newPartVideo, 1, 3, newPartVideo.outPoint - 3, 2);
            addAudioProperty(newPartVideo, 2, 1, newPartVideo.inPoint, 1);
            addAudioProperty(newPartVideo, 2, 3, newPartVideo.outPoint - 3, 2);
            newPartVideo.property('Position').setValue([compSize[0] / 2, compSize[1] / 2]);
            rankPartSize = compSize;
            topLogo = addCompLayer(target, '周刊Logo', partVideoDuration + 0.2, partOffset);
            topLogo.property('Scale').setValue([(compSize[0] / 640) * 100, (compSize[1] / 384) * 100]);
            topLogo.property('Position').setValue([compSize[0] / 2, compSize[1] / 2]);
            addVideoProperty(topLogo, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
        } else if (needProperty) {
            addVideoProperty(newPartVideo, 1, 0.6, newPartVideo.inPoint, 1);
            addVideoProperty(newPartVideo, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
            addAudioProperty(newPartVideo, 1, 1, newPartVideo.inPoint, 1);
            addAudioProperty(newPartVideo, 1, 1, newPartVideo.outPoint - 1, 2);
        } else {
            addAudioProperty(newPartVideo, 1, 1, newPartVideo.inPoint, 1);
            addAudioProperty(newPartVideo, 1, 1, newPartVideo.outPoint - 1, 2);
        }
        origLayerSize = newPartVideo.sourceRectAtTime(newPartVideo.inPoint, false);
        setFootageScale(newPartVideo, origLayerSize, rankPartSize, false);

        // Extra Step For Top 3
        if (isTop) {
            compBase = target.layers.addSolid([0, 0, 0], '黑底', compSize[0], compSize[1], 1, 12);
            compBase.inPoint = partOffset - videoOffset;
            if (!hasSubtitle) {
                newPartVideoS = addCompLayer(target, partVideoFile, 12, partOffset - videoOffset);
            } else {
                newPartVideoS = addCompLayer(target, partVideoFile + '_Subtitle', 12, partOffset - videoOffset);
            }
            newPartVideoS.audioEnabled = false;
            newPartVideoS.inPoint = newPartVideo.inPoint;
            newPartVideoS.outPoint = newPartVideo.inPoint + 12;
            origLayerSize = newPartVideoS.sourceRectAtTime(newPartVideoS.inPoint, false);
            setFootageScale(newPartVideoS, origLayerSize, rankVideoSize, false);
            newPartVideoS.property('Position').setValue([compSize[0] / 2 - 223, compSize[1] / 2 - 118]);
            if (isInvalid) {
                videoOffset = 0;
                invalidTextS = addCompLayer(target, '视频失效', partVideoDuration, partOffset);
                // invalidTextS.audioEnabled = false;
                invalidTextS.inPoint = partOffset;
                invalidTextS.outPoint = invalidTextS.inPoint + 12;
                origLayerSize = invalidTextS.sourceRectAtTime(invalidTextS.inPoint, false);
                invalidTextS.property('Scale').setValue([
                    (rankVideoSize[0] / origLayerSize.width) * 100,
                    (rankVideoSize[0] / origLayerSize.width) * 100,
                ]);
                invalidTextS.property('Position').setValue([compSize[0] / 2 - 223, compSize[1] / 2 - 118]);
            }
            compBase = addCompLayer(target, '蓝底', 5.4, partOffset - 0.4);
            addVideoProperty(compBase, 1, 0.4, partOffset - 0.4, 1);
            addCompLayer(target, partVideoMask, 7, partOffset + 5);
            rankTop = addCompLayer(target, partTopImg, 5, partOffset);
            addVideoProperty(rankTop, 1, 1, partOffset, 1);
            partOffset = partOffset + partVideoDuration + 0.2;
        } else {
            newPartMask = addCompLayer(target, partVideoMask, partVideoDuration, partOffset);
            if (needNext && lastRankNum - i > firstRankNum) {
                nextAudio = addCompLayer(target, 'NEXT_BGM', 1, partOffset + partVideoDuration);
                nextText = addCompLayer(target, 'NEXT', 1, partOffset + partVideoDuration);
                partOffset = partOffset + partVideoDuration + 1;
            } else if (lastRankNum - i > firstRankNum) {
                partOffset = partOffset + partVideoDuration;
            } else {
                if (isInvalid) {
                    addVideoProperty(invalidText, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
                }
                addVideoProperty(newPartVideo, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
                addVideoProperty(newPartMask, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
                partOffset = partOffset + partVideoDuration;
            }
        }
    }
    return partOffset;
}

function setFootageScale(target, from, to, reverse) {
    wide = from.width / from.height >= to[0] / to[1];
    axis = (wide ? 0 : 1) ^ (reverse ? 1 : 0);
    scale = (to[axis] / (axis == 0 ? from.width : from.height)) * 100;
    target.property('Scale').setValue([scale, scale]);
}

function chapterTimeCount(time) {
    return Math.ceil(time) + 1;
}

function getWeekLabel() {
    date = new Date(
        (YUME + WEEK_NUM * 3600 * 24 * 7 - 86400) * 1000
    );
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
    firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    week = Math.floor((day - 1) / 7) + 1;
    if (firstDay === 0) {
        week += 1;
    }
    return [year,month,week];
}

// Part 1
compAudio1 = addCompLayer(rankPart1, '夏之随想_BGM', 40.5, 0);
addAudioProperty(compAudio1, 1, 2.3, 38.2, 2);
compBase1 = addCompLayer(rankPart1, '蓝底', 40.5, 0);
titleText1 = addCompLayer(rankPart1, '标题', 4.5, 0);
addVideoProperty(titleText1, 1, 0.6, 0, 1);
addVideoProperty(titleText1, 1, 0.6, 3.9, 2);
warningText1 = addCompLayer(rankPart1, '注意事项_1', 2.3, 4.7);
addVideoProperty(warningText1, 2, 0.3, 4.7, 1);
warningText2 = addCompLayer(rankPart1, '注意事项_2', 2.3, 7);
addVideoProperty(warningText2, 2, 0.3, 9, 2);
bgmText = addCompLayer(rankPart1, '夏之随想', 5.5, 0.5);
addVideoProperty(bgmText, 2, 2, 0, 1);
addVideoProperty(bgmText, 2, 2, 4, 2);
worldText = addCompLayer(rankPart1, '哔哩哔哩', 4.5, 9.5);
addVideoProperty(worldText, 1, 0.3, 9.5, 1);
addVideoProperty(worldText, 1, 0.3, 13.7, 2);
rangeText = addCompLayer(rankPart1, '集计时间', 4.5, 14.3);
addVideoProperty(rangeText, 2, 0.3, 14.3, 1);
addVideoProperty(rangeText, 1, 0.3, 18.5, 2);
openingText = addCompLayer(rankPart1, 'Opening', 4.8, 19);
addVideoProperty(openingText, 1, 0.5, 19, 1);
addVideoProperty(openingText, 1, 0.5, 23.3, 2);
ruleText1 = addCompLayer(rankPart1, '规则说明', 4.3, 24);
addVideoProperty(ruleText1, 2, 0.6, 24, 1);
ruleText2 = addCompLayer(rankPart1, '特殊说明', 4.2, 28.3);
ruleText3 = addCompLayer(rankPart1, '普通规则', 4, 32.5);
ruleText4 = addCompLayer(rankPart1, '新番规则', 4, 36.5);
addVideoProperty(ruleText4, 2, 0.7, 39.8, 2);

// Part 2
compAudio2 = addCompLayer(rankPart2, 'Pickup_BGM', 4, 0);
addAudioProperty(compAudio2, 1, 1, 0, 1);
addAudioProperty(compAudio2, 1, 1, 3, 2);
compBase2 = addCompLayer(rankPart2, '蓝底', 4, 0);
nextText2 = addCompLayer(rankPart2, 'Pickup_切换', 4, 0);
addVideoProperty(nextText2, 2, 1, 0, 1);

// Part 3
rankPart3.duration = addRankPart(rankPart3, rankDataList[0], false, true, 0, false);

// Part 4
compBase4 = addCompLayer(rankPart4, '蓝底', 4, 0);
nextAudio4 = addCompLayer(rankPart4, '主榜切换_BGM', 4, 0);
addAudioProperty(nextAudio4, 1, 1, 3, 2);
nextText4 = addCompLayer(rankPart4, '主榜切换_1', 4, 0);
addVideoProperty(nextText4, 2, 1, 0, 1);

// Part 5 (30+ to 21)
rankPart5.duration = addRankPart(rankPart5, rankDataList[1], true, false, 0, false);

// Part 6 (tv & bangumi)
compBase6 = addCompLayer(rankPart6, '棕底', 56.6, 0);
compAudio6 = addCompLayer(rankPart6, '影视国创_BGM', 56.6, 0 - 30);
compAudio6.inPoint = 0;
compAudio6.outPoint = 56.6;
addAudioProperty(compAudio6, 1, 1.8, compAudio6.inPoint, 1);
addAudioProperty(compAudio6, 1, 3.2, compAudio6.outPoint - 3.2, 2);
filmSubCard = addCompLayer(rankPart6, '影视切换', 3.73, 0);
addVideoProperty(filmSubCard, 2, 0.5, 0, 1);
addVideoProperty(filmSubCard, 2, 0.5, 3.23, 2);
filmSubRank1 = addCompLayer(rankPart6, '影视副榜_1', 7.6, 4);
addVideoProperty(filmSubRank1, 2, 0.5, 4, 1);
filmSubRank2 = addCompLayer(rankPart6, '影视副榜_2', 7, 11.6);
filmSubRank3 = addCompLayer(rankPart6, '影视副榜_3', 7, 18.6);
addVideoProperty(filmSubRank3, 2, 0.6, 25, 2);
chineseSubCard = addCompLayer(rankPart6, '国创副榜', 3.6, 26);
addVideoProperty(chineseSubCard, 2, 0.5, 26, 1);
addVideoProperty(chineseSubCard, 2, 0.5, 29.1, 2);
chineseSubRank4 = addCompLayer(rankPart6, '国创副榜_1', 7.5, 30);
addVideoProperty(chineseSubRank4, 2, 0.5, 30, 1);
chineseSubRank5 = addCompLayer(rankPart6, '国创副榜_2', 7.5, 37.5);
// addVideoProperty(chineseSubRank5, 2, 0.5, 44.5, 1);
chineseSubRank6 = addCompLayer(rankPart6, '国创副榜_3', 8.4, 45);
addVideoProperty(chineseSubRank6, 2, 0.5, 52, 2);
chineseCard = addCompLayer(rankPart6, '国创切换', 3.7, 52.9);
addVideoProperty(chineseCard, 2, 0.6, 52.9, 1);

// Part 7 (tv & bangumi)
rankPart7.duration = addRankPart(rankPart7, rankDataList[2], false, false, 0, false);

// Part 8
compBase8 = addCompLayer(rankPart8, '蓝底', 4, 0);
nextAudio8 = addCompLayer(rankPart8, '主榜切换_BGM', 4, 0);
addAudioProperty(nextAudio8, 1, 1, 3, 2);
nextText8 = addCompLayer(rankPart8, '主榜切换_2', 4, 0);
addVideoProperty(nextText8, 2, 1, 0, 1);

// Part 9 (20 to 11)
rankPart9.duration = addRankPart(rankPart9, rankDataList[3], true, false, 0, false);

// Part 10 (bangumi)
if (BANGUMI) {
    compBase10 = addCompLayer(rankPart10, '棕底', 33, 0);
    compAudio10 = addCompLayer(rankPart10, '新番副榜_BGM', 33, 0 - 4.3);
    compAudio10.inPoint = 0;
    compAudio10.outPoint = 33;
    addAudioProperty(compAudio10, 1, 1.73, compAudio10.inPoint, 1);
    addAudioProperty(compAudio10, 1, 3, compAudio10.outPoint - 3, 2);
    bangumiSubCard = addCompLayer(rankPart10, '新番切换', 5, 0);
    addVideoProperty(bangumiSubCard, 2, 0.5, 0, 1);
    addVideoProperty(bangumiSubCard, 2, 0.5, 4.5, 2);
    bangumiSubRank1 = addCompLayer(rankPart10, '新番副榜_1', 7, 5.3);
    addVideoProperty(bangumiSubRank1, 2, 0.5, 5.3, 1);
    bangumiSubRank2 = addCompLayer(rankPart10, '新番副榜_2', 7, 12.3);
    bangumiSubRank3 = addCompLayer(rankPart10, '新番副榜_3', 7, 19.3);
    addVideoProperty(bangumiSubRank3, 2, 0.5, 25.8, 2);
    bangumiCard = addCompLayer(rankPart10, '新番主榜', 6.4, 26.6);
    addVideoProperty(bangumiCard, 1, 1, 26.6, 1);
}

// Part 11 (bangumi)
if (BANGUMI) {
    rankPart11.duration = addRankPart(rankPart11, rankDataList[4], false, false, 0, false);
}

// Part 12
compBase12 = addCompLayer(rankPart12, '蓝底', 4, 0);
nextAudio12 = addCompLayer(rankPart12, '主榜切换_BGM', 4, 0);
addAudioProperty(nextAudio12, 1, 1, 3, 2);
nextText12 = addCompLayer(rankPart12, '主榜切换_3', 4, 0);
addVideoProperty(nextText12, 2, 1, 0, 1);

// Part 13 (10 to 4)
rankPart13.duration = addRankPart(rankPart13, rankDataList[5], true, false, 0, false);

// Part 14
compBase14 = addCompLayer(rankPart14, '棕底', 14.4, 0);
compAudio14 = addCompLayer(rankPart14, '历史数据_BGM', 14.4, 0);
compAudio14.inPoint = 0;
compAudio14.outPoint = 14.4;
addAudioProperty(compAudio14, 1, 1, compAudio14.outPoint - 1, 2);
historyRecord = addCompLayer(rankPart14, '历史记录', 7.2, 0.2);
addVideoProperty(historyRecord, 1, 0.5, 0.2, 1);
addVideoProperty(historyRecord, 1, 0.5, 6.9, 2);
historyCard = addCompLayer(rankPart14, '历史切换', 6.5, 7.9);
addVideoProperty(historyCard, 1, 0.5, 7.9, 1);

// Part 15 (history)
rankPart15.duration = addRankPart(rankPart15, rankDataList[6], false, false, 0, false);

// Part 16 (3 to 1)
rankPart16.duration = addRankPart(rankPart16, rankDataList[7], false, false, 0, true);

// Part 17
compBase17 = addCompLayer(rankPart17, '棕底', 25, 0);
addVideoProperty(compBase17, 1, 0.5, 24.5, 2);
bilibiliAudio = addCompLayer(rankPart17, '哔哩哔哩_BGM', 25, 0);
bilibiliAudio.inPoint = 0;
bilibiliAudio.outPoint = 25;
addAudioProperty(bilibiliAudio, 1, 3, bilibiliAudio.outPoint - 3, 2);
statText1 = addCompLayer(rankPart17, '统计数据_1', 6, 0.4);
addVideoProperty(statText1, 2, 0.6, 0.4, 1);
statText2 = addCompLayer(rankPart17, '统计数据_2', 6, 6.4);
statText3 = addCompLayer(rankPart17, '统计数据_3', 6, 12.4);
addVideoProperty(statText3, 2, 0.6, 17.8, 2);
freeTalkText = addCompLayer(rankPart17, '本周结语', 6.5, 18.5);
addVideoProperty(freeTalkText, 2, 0.5, 18.5, 1);
addVideoProperty(freeTalkText, 2, 0.5, 24.3, 2);

// Part 18 (30+ to 150 +)
compAudio18 = addCompLayer(rankPart18, 'ED_BGM', null, 0);
endingAudioLength = app.project.items[footageItemID.ED_BGM].duration;
compAudio18.inPoint = 0;
compAudio18.outPoint = endingAudioLength;

compBase18 = addCompLayer(rankPart18, '棕底', endingAudioLength - 9, 9);
addVideoProperty(compBase18, 1, 1, endingAudioLength - 1, 2);
addAudioProperty(compAudio18, 1, 0.6, 0, 1);
addAudioProperty(compAudio18, 1, 1, endingAudioLength - 1, 2);
subRankLength = (endingAudioLength - 19.5) / 30;
for (i = 1; i < 30; i++) {
    addCompLayer(rankPart18, i, subRankLength, 9 + (i - 1) * subRankLength);
}
lastRankCard = addCompLayer(rankPart18, i, subRankLength, 9 + subRankLength * 29);
addVideoProperty(lastRankCard, 1, 0.6, 9 + subRankLength * 30 - 0.6, 2);
staffList = addCompLayer(rankPart18, 'STAFF_名单', 4.6, 0);
addVideoProperty(staffList, 1, 0.6, 0, 1);
addVideoProperty(staffList, 1, 0.6, 4, 2);
albumCover = addCompLayer(rankPart18, 'ED封面', 5.9, 4);
albumCover.property('Position').setValue([170, 926]);
origLayerSize = albumCover.sourceRectAtTime(albumCover.inPoint, false);
setFootageScale(albumCover,origLayerSize,albumCoverSize,true);

nextText18 = addCompLayer(rankPart18, '主榜切换_4', 5.9, 4);
sortedRank = [];
for (key in rankDataList[1]) {
    sortedRank[sortedRank.length] = key;
}
lastRankNum = Math.max.apply(Math, sortedRank);
subRankRange = addTextLayer(rankPart18, (lastRankNum + 1) + '-' + (lastRankNum + 120), ParagraphJustification.CENTER_JUSTIFY, [700, 226], [605, 523]);
subRankRange.startTime = 4;
subRankRange.outPoint = 4 + 5.9;
subRankRange.property('Source Text').expression = textExpression('HYm2gj', 'FFFFFF', 216, 108, 0, (lastRankNum + 1) + '-' + (lastRankNum + 120));
subRankRange.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.width/2+s.left, s.height/2+s.top];';
file = new File('./ranking/#' + WEEK_NUM + '/' + WEEK_NUM + '.txt');
file.open('r');
content = file.read();
file.close();
endingAlbumTextShadow = addTextLayer(rankPart18, content, ParagraphJustification.LEFT_JUSTIFY, [1640, 140], [291, 861]);
endingAlbumTextShadow.startTime = 4;
endingAlbumTextShadow.outPoint = 4 + 5.9;
endingAlbumTextShadow.property('Source Text').expression = 'text.sourceText.createStyle().setFont("FZY3K--GBK1-0").setFillColor(hexToRgb("000000")).setFontSize(30).setLeading(48).setTracking(100).setFauxBold(true);';
endingAlbumTextShadow.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
endingAlbumText = addTextLayer(rankPart18, content, ParagraphJustification.LEFT_JUSTIFY, [1640, 140], [290, 860]);
endingAlbumText.startTime = 4;
endingAlbumText.outPoint = 4 + 5.9;
endingAlbumText.property('Source Text').expression = 'text.sourceText.createStyle().setFont("FZY3K--GBK1-0").setFillColor(hexToRgb("FFFFFF")).setFontSize(30).setLeading(48).setTracking(100).setFauxBold(true);';
endingAlbumText.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';

addVideoProperty(albumCover, 1, 0.6, 4, 1);
addVideoProperty(albumCover, 1, 0.6, 9.3, 2);
addVideoProperty(nextText18, 1, 0.6, 4, 1);
addVideoProperty(nextText18, 1, 0.6, 9.3, 2);
addVideoProperty(subRankRange, 1, 0.6, 4, 1);
addVideoProperty(subRankRange, 1, 0.6, 9.3, 2);
addVideoProperty(endingAlbumText, 1, 0.6, 4, 1);
addVideoProperty(endingAlbumText, 1, 0.6, 9.3, 2);
addVideoProperty(endingAlbumTextShadow, 1, 0.6, 4, 1);
addVideoProperty(endingAlbumTextShadow, 1, 0.6, 9.3, 2);
usedFootage = addCompLayer(rankPart18, '插入素材', 5, endingAudioLength - 10);
addVideoProperty(usedFootage, 1, 0.6, endingAudioLength - 10, 1);
addVideoProperty(usedFootage, 1, 0.6, endingAudioLength - 5.6, 2);
endingCardLayer = addCompLayer(rankPart18, 'EDCard', 5, endingAudioLength - 5);
addVideoProperty(endingCardLayer, 1, 0.6, endingAudioLength - 5, 1);
addVideoProperty(endingCardLayer, 1, 1, endingAudioLength - 1, 2);
rankPart18.duration = endingAudioLength + 0.1;

chapterRankPart = [
    { 'parts': [rankPart1], 'content': 'OP' },
    { 'parts': [rankPart2, rankPart3], 'content': 'Pickup' },
    { 'parts': [rankPart4, rankPart5], 'content': '21-30+' },
    { 'parts': [rankPart6, rankPart7], 'content': '影视&国创' },
    { 'parts': [rankPart8, rankPart9], 'content': '11-20' },
];
if (BANGUMI) {
    chapterRankPart[chapterRankPart.length] = { 'parts': [rankPart10, rankPart11], 'content': '番剧' };
}
chapterRankPart[chapterRankPart.length] = { 'parts': [rankPart12, rankPart13], 'content': '4-10' };
chapterRankPart[chapterRankPart.length] = { 'parts': [rankPart14, rankPart15], 'content': '历史' };
chapterRankPart[chapterRankPart.length] = { 'parts': [rankPart16], 'content': '1-3' };
chapterRankPart[chapterRankPart.length] = { 'parts': [rankPart17, rankPart18], 'content': 'ED' };

compBaseLayer = finalComp.layers.addSolid([0, 0, 0], '黑底', compSize[0], compSize[1], 1, 1);
finalCompDuration = 0;
for (n = 0; n < chapterRankPart.length; n++) {
    chapterRankPart[n].from = finalCompDuration;
    for (i = 0; i < chapterRankPart[n].parts.length; i++) {
        part = chapterRankPart[n].parts[i];
        addCompLayer(finalComp, part.name, part.duration, finalCompDuration);
        finalCompDuration += part.duration;
    }
    chapterRankPart[n].to = finalCompDuration;
}
finalComp.duration = finalCompDuration;
compBaseLayer.outPoint = finalComp.duration;
finalComp.openInViewer();

CURRENT_WEEK = getWeekLabel();
yearText = 'The ' + (CURRENT_WEEK[0] - 2009) + 'th year';
coverConfigs = [
    { comp: coverComp1, anniversaryPosition: [128, 384], weekPosition: [134, 254] },
    { comp: coverComp2, anniversaryPosition: [48, 428], weekPosition: [54, 298] },
];
for (i = 0; i < coverConfigs.length; i++) {
    cover = coverConfigs[i];
    addCompLayer(cover.comp, '投稿封面_1', 25, 0);
    normalCover = addCompLayer(cover.comp, '投稿封面_2', 25, 0);
    addCompLayer(cover.comp, '投稿封面_3', 25, 0);
    weekText = addTextLayer(cover.comp, '#' + WEEK_NUM, ParagraphJustification.LEFT_JUSTIFY, [440, 140], cover.weekPosition);
    weekText.property('Source Text').expression = textExpression('HYQiHei-AZEJ', 'FFFFFF', 122, 60, 100, '#' + WEEK_NUM);
    weekText.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
    weekText.applyPreset(new File('./footage/DropShadow.ffx'));
    if (CURRENT_WEEK[1] == 6 && CURRENT_WEEK[2] == 4) {
        normalCover.enabled = false;
        anniversaryText = addTextLayer(cover.comp, yearText, ParagraphJustification.LEFT_JUSTIFY, [540, 100], cover.anniversaryPosition);
        anniversaryText.property('Source Text').expression = textExpression('HYQiHei-AZEJ', 'FFFFFF', 64, 60, 60, yearText);
        anniversaryText.property('Anchor Point').expression = 's=sourceRectAtTime();transform.anchorPoint=[s.left, s.top];';
        anniversaryText.applyPreset(new File('./footage/DropShadow.ffx'));
    }
    cover.comp.openInViewer();
}

renderQueue = app.project.renderQueue;
render = renderQueue.items.add(coverComp1);
render.outputModules[1].applyTemplate('JPEG 序列');
render.outputModules[1].file = new File('./封面_169_[#].jpg');
render = renderQueue.items.add(coverComp2);
render.outputModules[1].applyTemplate('JPEG 序列');
render.outputModules[1].file = new File('./封面_43_[#].jpg');
render = renderQueue.items.add(finalComp);
render.outputModules[1].applyTemplate('Voukoder Classic MP4');
render.outputModules[1].file = new File('./周刊哔哩哔哩排行榜#' + WEEK_NUM + '.mp4');

app.project.consolidateFootage();
app.project.save(new File('./bilibilirank_' + WEEK_NUM + '.aep'));

chapterTimeStamp = [];
for (n = 0; n < chapterRankPart.length; n++) {
    chapterTimeStamp[n] = {
        'from': n == 0 ? 0 : chapterTimeCount(chapterRankPart[n].from),
        'to': chapterTimeCount(chapterRankPart[n].to),
        'content': chapterRankPart[n].content
    };
}
doc = new File('./stamp.json');
doc.encoding = 'UTF-8';
doc.open('w');
doc.write(JSON.stringify(chapterTimeStamp));
doc.close();
