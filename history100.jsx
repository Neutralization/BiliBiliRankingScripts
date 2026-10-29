// @include 'json2/json2.js';
app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
YUME = 1277009809;
WEEK_NUM = Math.floor((Date.now() / 1000 - YUME + 133009) / 3600 / 24 / 7);
HISTORY_NUM = Math.floor(WEEK_NUM / 100) * 100;
app.newProject();
app.project.workingSpace = 'Rec.709 Gamma 2.4';
app.project.bitsPerChannel = 8;
finalComp = app.project.items.addComp('bilirank_100history', 1920, 1080, 1, 1800, 60);
staticFolder = app.project.items.addFolder('StaticResource');
historyFolder = app.project.items.addFolder('HistoryResource');

rankVideoSize = [1440, 810];
compSize = [1920, 1080];
fileFolder = './ranking/history' + HISTORY_NUM + '/';
rankYamlRegex = /- :rank: (\d+)\n {2}:name: (\w+)\n {2}:length: (\d+)\n {2}:offset: (\d+)(\n {2}:short: \d+)?(\n {2}:no_pause: true)?/gm;
rankDataGroup = '$1: ["$2", $3, $4],';
rankDataList = [];
file = new File(fileFolder + HISTORY_NUM + '.yml');
file.open('r');
ymlString = file.read();
file.close();
rankPartList = ymlString.replace(rankYamlRegex, rankDataGroup).replace('\'', '"').replace('---', '{') + '}';
rankPartList = rankPartList.replace(',\n}', '\n}');
rankDataList[rankDataList.length] = JSON.parse(rankPartList);
lostFile = new File('./footage/LostFile.json');
lostFile.open('r');
content = lostFile.read();
lostFile.close();
lostVideos = JSON.parse(content);
legacyLostVideos = lostVideos.name instanceof [].constructor ? lostVideos.name : [];

function isLostVideo(name) {
    if (name in lostVideos) return true;
    for (lost = 0; lost < legacyLostVideos.length; lost++) {
        if (name == legacyLostVideos[lost]) return true;
    }
    return false;
}

rankData = rankDataList[0];

staticFootage = {
    // IMAGE
    spop: './footage/public/spop.png',
    sped: './footage/public/sped.png',
    Invalid: './footage/public/invalid.png',
    // AUDIO
    op_audio: './footage/audio/54 - Subtitle 1.mp3',
    ed_audio: './footage/audio/55 - Subtitle 2.mp3',
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
        footageFilePath = fileFolder + key + '_' + footageFileName + '.mp4';
        footageFile = new ImportOptions(File(footageFilePath));
        footageFile.ImportAs = ImportAsType.FOOTAGE;
        footageFileItem = app.project.importFile(footageFile);
        footageFileItem.pixelAspect = 1.0;
        footageFileItem.name = key + '_' + rankDataList[n][key][0];
        footageFileItem.parentFolder = historyFolder;
    }
    // IMPORT IMAGE
    for (key in rankDataList[n]) {
        footageFileName = rankDataList[n][key][0];
        footageFilePath = fileFolder + key + '_' + footageFileName + '.png';
        footageFile = new ImportOptions(File(footageFilePath));
        footageFile.ImportAs = ImportAsType.FOOTAGE;
        footageFileItem = app.project.importFile(footageFile);
        footageFileItem.pixelAspect = 1.0;
        footageFileItem.name = key + '_' + rankDataList[n][key][0] + '_';
        footageFileItem.parentFolder = historyFolder;
    }
}

// ITEM INDEX
footageItemID = {};
for (n = 1; n <= app.project.items.length; n++) {
    footageItemID[app.project.items[n].name] = n;
}

// FUNCTION
function addCompLayer(target, name, duration, start) {
    newLayer = target.layers.add(app.project.items[footageItemID[name]], duration);
    newLayer.startTime = start;
    return newLayer;
}

function addAudioProperty(target, pType, duration, offset, direction) {
    newProperty = target.property('Audio Levels');
    if (pType == 1) {
        // circle
        if (direction == 1) {
            // fade in
            for (t = offset; t <= offset + duration; t += 0.01) {
                newProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow(1 - (t - offset) / duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow(1 - (t - offset) / duration, 2)) - 1) * 50,
                ]);
            }
            newProperty.setValueAtTime(offset, [-100, -100]);
        }
        if (direction == 2) {
            // fade out
            for (t = offset; t <= offset + duration; t += 0.01) {
                newProperty.setValueAtTime(t, [
                    (Math.sqrt(1 - Math.pow((t - offset) / duration, 2)) - 1) * 50,
                    (Math.sqrt(1 - Math.pow((t - offset) / duration, 2)) - 1) * 50,
                ]);
            }
            newProperty.setValueAtTime(offset + duration, [-100, -100]);
        }
    }
    if (pType == 2) {
        // sin
        if (direction == 1) {
            // fade in
            for (t = offset; t <= offset + duration; t += 0.01) {
                newProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - offset)) / duration) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - offset)) / duration) + 1) / 2) * -50,
                ]);
            }
            newProperty.setValueAtTime(offset, [-100, -100]);
        }
        if (direction == 2) {
            // fade out
            for (t = offset; t <= offset + duration; t += 0.01) {
                newProperty.setValueAtTime(t, [
                    ((Math.cos((Math.PI * (t - offset)) / duration + Math.PI) + 1) / 2) * -50,
                    ((Math.cos((Math.PI * (t - offset)) / duration + Math.PI) + 1) / 2) * -50,
                ]);
            }
            newProperty.setValueAtTime(offset + duration, [-100, -100]);
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
            for (t = offset; t <= offset + duration; t += 0.01) {
                newProperty.setValueAtTime(
                    t,
                    ((Math.cos((Math.PI * (t - offset)) / duration + Math.PI) + 1) / 2) * 100
                );
            }
            newProperty.setValueAtTime(offset + duration, 100);
        }
        if (direction == 2) {
            // fade out
            for (t = offset; t <= offset + duration; t += 0.01) {
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
            newProperty.property(1).setValueAtTime(offset, 100);
            newProperty.property(1).setValueAtTime(offset + duration, 0);
            // Transition Angle
            newProperty.property(2).setValueAtTime(offset, 315);
            newProperty.property(2).setValueAtTime(offset + duration, 315);
            // Feather
            newProperty.property(3).setValueAtTime(offset, 50);
            newProperty.property(3).setValueAtTime(offset + duration, 50);
        }
        if (direction == 2) {
            // fade out
            newProperty.property(1).setValueAtTime(offset, 0);
            newProperty.property(1).setValueAtTime(offset + duration, 100);
            newProperty.property(2).setValueAtTime(offset, 135);
            newProperty.property(2).setValueAtTime(offset + duration, 135);
            newProperty.property(3).setValueAtTime(offset, 50);
            newProperty.property(3).setValueAtTime(offset + duration, 50);
        }
    }
    return newProperty;
}

function addRankPart(rankData, firstRank, needSpace, needProperty, globalOffset) {
    globalOffset = Number(globalOffset.toFixed(1));
    sortedRank = [];
    for (rank in rankData) {
        sortedRank[sortedRank.length] = rank;
    }
    lastRank = Math.min.apply(Math, sortedRank);
    firstRank = Math.max.apply(Math, sortedRank);
    for (i = 0; lastRank + i <= firstRank; i++) {
        if (!(lastRank + i in rankData)) {
            continue;
        }
        isLost = isLostVideo(rankData[lastRank + i][0]);
        partVideoFile = (isLost == false) ? lastRank + i + '_' + rankData[lastRank + i][0] : 'NotFound';
        // partVideoFile = lastRank + i + '_' + rankData[lastRank + i][0];
        partVideoMask = lastRank + i + '_' + rankData[lastRank + i][0] + '_';
        partVideoDuration = rankData[lastRank + i][1];
        partTrueDuration = app.project.items[footageItemID[partVideoFile]].duration;
        if (partTrueDuration < partVideoDuration) {
            partVideoDuration = partTrueDuration;
        }
        videoOffset = rankData[lastRank + i][2];
        videoOffset = 0;
        newPartVideo = addCompLayer(finalComp, partVideoFile, partVideoDuration, globalOffset - videoOffset);
        newPartVideo.inPoint = globalOffset;
        newPartVideo.outPoint = globalOffset + partVideoDuration;
        newPartVideo.inPoint = newPartVideo.outPoint - partVideoDuration;
        newPartVideo.outPoint = newPartVideo.inPoint + partVideoDuration;
        if (isLost == true) {
            invalidText = addCompLayer(finalComp, 'Invalid', partVideoDuration, globalOffset - videoOffset);
            invalidText.inPoint = globalOffset;
            invalidText.outPoint = globalOffset + partVideoDuration;
            invalidText.inPoint = invalidText.outPoint - partVideoDuration;
            invalidText.outPoint = invalidText.inPoint + partVideoDuration;
            invalidText.property('Scale').setValue([75, 75]);
            invalidText.property('Position').setValue([compSize[0] / 2 - 223, compSize[1] / 2 - 118]);
        }
        if (needProperty) {
            addVideoProperty(newPartVideo, 1, 0.6, newPartVideo.inPoint, 1);
            addVideoProperty(newPartVideo, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
            if (isLost == true) {
                addVideoProperty(invalidText, 1, 0.6, newPartVideo.inPoint, 1);
                addVideoProperty(invalidText, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
            }
        }
        addAudioProperty(newPartVideo, 1, 0.6, newPartVideo.inPoint, 1);
        addAudioProperty(newPartVideo, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
        origLayerSize = newPartVideo.sourceRectAtTime(newPartVideo.inPoint, false);
        if (origLayerSize.width / origLayerSize.height >= 16 / 9) {
            newPartVideo.property('Scale').setValue([
                (rankVideoSize[0] / origLayerSize.width) * 100,
                (rankVideoSize[0] / origLayerSize.width) * 100,
            ]);
        } else {
            newPartVideo.property('Scale').setValue([
                (rankVideoSize[1] / origLayerSize.height) * 100,
                (rankVideoSize[1] / origLayerSize.height) * 100,
            ]);
        }
        newPartVideo.property('Position').setValue([compSize[0] / 2 - 223, compSize[1] / 2 - 118]);
        newPartVideo.comment = lastRank + i + '-' + partVideoFile;
        writeLn(newPartVideo.comment); // DEBUG

        newPartMask = addCompLayer(finalComp, partVideoMask, partVideoDuration, globalOffset);
        if (needSpace && lastRank + i > firstRank) {
            nextText = addCompLayer(finalComp, '0_change', 1, globalOffset + partVideoDuration);
            nextAudio = addCompLayer(finalComp, '0_change_audio', 1, globalOffset + partVideoDuration);
            globalOffset = globalOffset + partVideoDuration + 1;
        } else if (lastRank + i > firstRank) {
            globalOffset = globalOffset + partVideoDuration;
        } else {
            if (isLost == true) {
                addVideoProperty(invalidText, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
            }
            addVideoProperty(newPartVideo, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
            //addVideoProperty(newPartMask, 1, 0.6, newPartVideo.outPoint - 0.6, 2);
            globalOffset = globalOffset + partVideoDuration;
        }
    }
    return globalOffset;
}

// Part 1
opAudioLayer = addCompLayer(finalComp, 'op_audio', 5, 0);
addAudioProperty(opAudioLayer, 1, 0.6, 0, 1);
addAudioProperty(opAudioLayer, 1, 0.6, 4.4, 2);
opLayer = addCompLayer(finalComp, 'spop', 5, 0);
addVideoProperty(opLayer, 1, 0.6, 0, 1);

// Part 2
globalRankOffset = addRankPart(rankData, 4, false, false, 5);

// Part 3
edAudioLayer = addCompLayer(finalComp, 'ed_audio', 6, globalRankOffset);
addAudioProperty(edAudioLayer, 1, 0.6, globalRankOffset, 1);
addAudioProperty(edAudioLayer, 1, 0.6, globalRankOffset + 5.4, 2);
edLayer = addCompLayer(finalComp, 'sped', 6, globalRankOffset);
addVideoProperty(edLayer, 1, 0.6, globalRankOffset, 1);

finalComp.openInViewer();

finalComp.duration = globalRankOffset + 6;
renderQueue = app.project.renderQueue;
render = renderQueue.items.add(finalComp);
render.outputModules[1].applyTemplate('Voukoder Classic MP4');
render.outputModules[1].file = new File('./【百期纪念】历代一位回顾.mp4');

app.project.save(File('./bilirank_history' + HISTORY_NUM + '.aep'));
