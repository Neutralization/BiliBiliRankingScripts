// @include 'json2/json2.js';
app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
YUME = 1277009809;
CurrentWeek = Math.floor((Date.now() / 1000 - YUME + 133009) / 3600 / 24 / 7);
HistoryNum = Math.floor(CurrentWeek / 100) * 100;
app.newProject();
app.project.workingSpace = 'Rec.709 Gamma 2.4';
app.project.bitsPerChannel = 8;
MasterComposition = app.project.items.addComp('bilirank_100history', 1920, 1080, 1, 1800, 60);
StaticFolder = app.project.items.addFolder('StaticResource');
WeeklyFolder = app.project.items.addFolder('HistoryResource');

NormalRankSize = [1440, 810];
VideoSize = [1920, 1080];
DirectoryPrefix = './ranking/list100/';
regex = /- :rank: (\d+)\n {2}:name: (\w+)\n {2}:length: (\d+)\n {2}:offset: (\d+)(\n {2}:short: \d+)?(\n {2}:no_pause: true)?/gm;
subst = '$1: ["$2", $3, $4],';
RankDataList = [];
file = new File(DirectoryPrefix + HistoryNum + '.yml');
file.open('r');
ymlstring = file.read();
file.close();
RankList = ymlstring.replace(regex, subst).replace('\'', '"').replace('---', '{') + '}';
RankList = RankList.replace(',\n}', '\n}');
RankDataList[RankDataList.length] = JSON.parse(RankList);
lostfile = new File('LostFile.json');
lostfile.open('r');
content = lostfile.read();
lostfile.close();
LostVideos = JSON.parse(content);
LegacyLostVideos = LostVideos.name instanceof Array ? LostVideos.name : [];

function IsLostVideo(name) {
    if (name in LostVideos) return true;
    for (lost = 0; lost < LegacyLostVideos.length; lost++) {
        if (name == LegacyLostVideos[lost]) return true;
    }
    return false;
}

RankData = RankDataList[0];

StaticResource = {
    // IMAGE
    spop: './ranking/pic/spop.png',
    sped: './ranking/pic/sped.png',
    Invalid: './public/invalid.png',
    // AUDIO
    op_audio: './public/54 - Subtitle 1.mp3',
    ed_audio: './public/55 - Subtitle 2.mp3',
    // VIDEO
    NotFound: './public/error.mp4'
};

for (key in StaticResource) {
    ResourceFile = new ImportOptions(File(StaticResource[key]));
    ResourceFile.ImportAs = ImportAsType.FOOTAGE;
    FileItem = app.project.importFile(ResourceFile);
    FileItem.name = key;
    FileItem.parentFolder = StaticFolder;
}

for (n = 0; n < RankDataList.length; n++) {
    // IMPORT VIDEO
    for (key in RankDataList[n]) {
        FileBaseName = RankDataList[n][key][0];
        FileFullPath = DirectoryPrefix + key + '_' + FileBaseName + '.mp4';
        ResourceFile = new ImportOptions(File(FileFullPath));
        ResourceFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(ResourceFile);
        FileItem.name = key + '_' + RankDataList[n][key][0];
        FileItem.parentFolder = WeeklyFolder;
    }
    // IMPORT IMAGE
    for (key in RankDataList[n]) {
        FileBaseName = RankDataList[n][key][0];
        FileFullPath = DirectoryPrefix + key + '_' + FileBaseName + '.png';
        ResourceFile = new ImportOptions(File(FileFullPath));
        ResourceFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(ResourceFile);
        FileItem.name = key + '_' + RankDataList[n][key][0] + '_';
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
    NewProperty = target.property('Audio Levels');
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
        NewProperty = target.property('Opacity');
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
        NewProperty = target.property('Effects').addProperty('ADBE Linear Wipe');
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

function AddRankPart(RankData, FirstRank, NeedSpace, NeedProperty, GlobalOffset) {
    GlobalOffset = Number(GlobalOffset.toFixed(1));
    SortRank = [];
    for (rank in RankData) {
        SortRank[SortRank.length] = rank;
    }
    LastRank = Math.min.apply(Math, SortRank);
    FirstRank = Math.max.apply(Math, SortRank);
    for (i = 0; LastRank + i <= FirstRank; i++) {
        if (!(LastRank + i in RankData)) {
            continue;
        }
        CheckLost = IsLostVideo(RankData[LastRank + i][0]);
        VideoFile = (CheckLost == false) ? LastRank + i + '_' + RankData[LastRank + i][0] : 'NotFound';
        // VideoFile = LastRank + i + '_' + RankData[LastRank + i][0];
        VideoMaskImage = LastRank + i + '_' + RankData[LastRank + i][0] + '_';
        VideoDuration = RankData[LastRank + i][1];
        TrueDuration = app.project.items[ResourceID[VideoFile]].duration;
        if (TrueDuration < VideoDuration) {
            VideoDuration = TrueDuration;
        }
        VideoOffset = RankData[LastRank + i][2];
        VideoOffset = 0;
        NewVideoLayer = AddLayer(MasterComposition, VideoFile, VideoDuration, GlobalOffset - VideoOffset);
        NewVideoLayer.inPoint = GlobalOffset;
        NewVideoLayer.outPoint = GlobalOffset + VideoDuration;
        NewVideoLayer.inPoint = NewVideoLayer.outPoint - VideoDuration;
        NewVideoLayer.outPoint = NewVideoLayer.inPoint + VideoDuration;
        if (CheckLost == true) {
            InvalidLayer = AddLayer(MasterComposition, 'Invalid', VideoDuration, GlobalOffset - VideoOffset);
            InvalidLayer.inPoint = GlobalOffset;
            InvalidLayer.outPoint = GlobalOffset + VideoDuration;
            InvalidLayer.inPoint = InvalidLayer.outPoint - VideoDuration;
            InvalidLayer.outPoint = InvalidLayer.inPoint + VideoDuration;
            InvalidLayer.property('Scale').setValue([75, 75]);
            InvalidLayer.property('Position').setValue([VideoSize[0] / 2 - 223, VideoSize[1] / 2 - 118]);
        }
        if (NeedProperty) {
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            if (CheckLost == true) {
                AddVideoProperty(InvalidLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
                AddVideoProperty(InvalidLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            }
        }
        AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.inPoint, 0.6, 1);
        AddAudioProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
        VideoItemSize = NewVideoLayer.sourceRectAtTime(NewVideoLayer.inPoint, false);
        if (VideoItemSize.width / VideoItemSize.height >= 16 / 9) {
            NewVideoLayer.property('Scale').setValue([
                (NormalRankSize[0] / VideoItemSize.width) * 100,
                (NormalRankSize[0] / VideoItemSize.width) * 100,
            ]);
        } else {
            NewVideoLayer.property('Scale').setValue([
                (NormalRankSize[1] / VideoItemSize.height) * 100,
                (NormalRankSize[1] / VideoItemSize.height) * 100,
            ]);
        }
        NewVideoLayer.property('Position').setValue([VideoSize[0] / 2 - 223, VideoSize[1] / 2 - 118]);
        NewVideoLayer.comment = LastRank + i + '-' + VideoFile;
        writeLn(NewVideoLayer.comment); // DEBUG

        NewVideoLayer_mask = AddLayer(MasterComposition, VideoMaskImage, VideoDuration, GlobalOffset);
        if (NeedSpace && LastRank + i > FirstRank) {
            ChangeLayer = AddLayer(MasterComposition, '0_change', 1, GlobalOffset + VideoDuration);
            ChangeAudioLayer = AddLayer(MasterComposition, '0_change_audio', 1, GlobalOffset + VideoDuration);
            GlobalOffset = GlobalOffset + VideoDuration + 1;
        } else if (LastRank + i > FirstRank) {
            GlobalOffset = GlobalOffset + VideoDuration;
        } else {
            if (CheckLost == true) {
                AddVideoProperty(InvalidLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            }
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            //AddVideoProperty(NewVideoLayer_mask, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            GlobalOffset = GlobalOffset + VideoDuration;
        }
    }
    return GlobalOffset;
}

// Part 1
OpAudioLayer = AddLayer(MasterComposition, 'op_audio', 5, 0);
AddAudioProperty(OpAudioLayer, 1, 0, 0.6, 1);
AddAudioProperty(OpAudioLayer, 1, 4.4, 0.6, 2);
OpLayer = AddLayer(MasterComposition, 'spop', 5, 0);
AddVideoProperty(OpLayer, 1, 0, 0.6, 1);

// Part 2
GlobalRankOffset = AddRankPart(RankData, 4, false, false, 5);

// Part 3
EdAudioLayer = AddLayer(MasterComposition, 'ed_audio', 6, GlobalRankOffset);
AddAudioProperty(EdAudioLayer, 1, GlobalRankOffset, 0.6, 1);
AddAudioProperty(EdAudioLayer, 1, GlobalRankOffset + 5.4, 0.6, 2);
EdLayer = AddLayer(MasterComposition, 'sped', 6, GlobalRankOffset);
AddVideoProperty(EdLayer, 1, GlobalRankOffset, 0.6, 1);

MasterComposition.duration = GlobalRankOffset + 6;
app.project.save(File('./bilirank_100history.aep'));

MasterComposition.openInViewer();
