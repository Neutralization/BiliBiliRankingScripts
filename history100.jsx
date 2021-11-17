YUME = 1277009809;
weeks = Math.round((Date.now() / 1000 - YUME) / 3600 / 24 / 7);

app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
app.newProject();
app.project.workingSpace = "Rec.709 Gamma 2.4";
MasterComposition = app.project.items.addComp("bilirank_100history", 1920, 1080, 1, 1800, 60);
StaticFolder = app.project.items.addFolder("StaticResource");
WeeklyFolder = app.project.items.addFolder("HistoryResource");

NormalRankSize = [1440, 810];
VideoSize = [1920, 1080];
DirectoryPrefix = ".\\ranking\\list100\\";
LostFile = "404_tv";
// @include "json2.js"
regex = /- :rank: (\d+)\n  :name: (\w+)\n  :length: (\d+)\n  :offset: (\d+)(\n  :short: \d+)?(\n  :no_pause: true)?/gm;
subst = '$1: ["$2", $3, $4],';
parts = [100];
RankDataList = [];
// alert(weeks);
for (n = 0; n < parts.length; n++) {
    file = new File(DirectoryPrefix + parts[n] + ".yml");
    file.open("r");
    ymlstring = file.read();
    file.close();
    RankList = ymlstring.replace(regex, subst).replace("'", '"').replace("---", "{") + "}";
    // alert(RankList);
    RankDataList[RankDataList.length] = JSON.parse(RankList);
}
lostfile = new File("LostFile.json");
lostfile.open("r");
content = lostfile.read();
lostfile.close();
LostVideos = JSON.parse(content)["name"];

RankData = RankDataList[0];

StaticResource = {
    // IMAGE
    spop: ".\\ranking\\pic\\spop.png",
    sped: ".\\ranking\\pic\\sped.png",
    // AUDIO
    op_audio: ".\\public\\54 - Subtitle 1.mp3",
    ed_audio: ".\\public\\55 - Subtitle 2.mp3",
    // VIDEO
    "404_tv": ".\\tv_x264.mp4",
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
        FileFullPath = DirectoryPrefix + FileBaseName + ".mp4";
        ResourceFile = new ImportOptions(File(FileFullPath));
        ResourceFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(ResourceFile);
        FileItem.name = RankDataList[n][key][0];
        FileItem.parentFolder = WeeklyFolder;
    }
    // IMPORT IMAGE
    for (key in RankDataList[n]) {
        FileBaseName = RankDataList[n][key][0];
        FileFullPath = DirectoryPrefix + FileBaseName + "_" + (601 - key) + ".png";
        ResourceFile = new ImportOptions(File(FileFullPath));
        ResourceFile.ImportAs = ImportAsType.FOOTAGE;
        FileItem = app.project.importFile(ResourceFile);
        FileItem.name = RankDataList[n][key][0] + "_" + (601 - key);
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

function AddRankPart(RankData, FirstRank, NeedSpace, NeedProperty, GlobalOffset) {
    GlobalOffset = Number(GlobalOffset.toFixed(1));
    SortRank = [];
    for (rank in RankData) {
        SortRank[SortRank.length] = rank;
    }
    LastRank = Math.max.apply(Math, SortRank);
    FirstRank = Math.min.apply(Math, SortRank);
    for (i = 0; LastRank - i >= FirstRank; i++) {
        if (!(LastRank - i in RankData)) {
            continue;
        }
        VideoFile = RankData[LastRank - i][0];
        VideoMaskImage = RankData[LastRank - i][0] + "_" + (601 - LastRank + i);
        VideoDuration = RankData[LastRank - i][1];
        TrueDuration = app.project.items[ResourceID[VideoFile]].duration;
        if (TrueDuration < VideoDuration) {
            VideoDuration = TrueDuration;
        }
        VideoOffset = RankData[LastRank - i][2];
        VideoOffset = 0;
        NewVideoLayer = AddLayer(MasterComposition, VideoFile, VideoDuration, GlobalOffset - VideoOffset);
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
        NewVideoLayer.property("Position").setValue([VideoSize[0] / 2 - 223, VideoSize[1] / 2 - 118]);
        NewVideoLayer.comment = LastRank - i + "-" + VideoFile;
        writeLn(NewVideoLayer.comment); // DEBUG

        CheckLost = false;
        for (lost in LostVideos) {
            if (RankData[LastRank - i][0] == LostVideos[lost]) CheckLost = true;
        }
        if (CheckLost == true) {
            VideoOffset = 0;
            LostVideoLayer = AddLayer(MasterComposition, LostFile, VideoDuration, GlobalOffset);
            LostVideoLayer.inPoint = GlobalOffset;
            LostVideoLayer.outPoint = GlobalOffset + VideoDuration;
            LostTextLayer = MasterComposition.layers.addText("视频已失效");
            LostTextDocument = LostTextLayer.property("Source Text").value;
            LostTextDocument.resetCharStyle();
            LostTextDocument.fontSize = 48;
            LostTextDocument.fillColor = [0.8, 0, 0];
            LostTextDocument.applyFill = true;
            LostTextDocument.font = "方正粗圆_GBK";
            LostTextDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
            LostTextLayer.inPoint = GlobalOffset;
            LostTextLayer.outPoint = GlobalOffset + VideoDuration;
            LostTextLayer.property("Position").setValue([1100, 777]);
            LostTextLayer.property("Source Text").setValue(LostTextDocument);
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
            LostVideoLayer.property("Position").setValue([VideoSize[0] / 2 - 223, VideoSize[1] / 2 - 118]);
        }
        NewVideoLayer_mask = AddLayer(MasterComposition, VideoMaskImage, VideoDuration, GlobalOffset);
        if (NeedSpace && LastRank - i > FirstRank) {
            ChangeLayer = AddLayer(MasterComposition, "0_change", 1, GlobalOffset + VideoDuration);
            ChangeAudioLayer = AddLayer(MasterComposition, "0_change_audio", 1, GlobalOffset + VideoDuration);
            GlobalOffset = GlobalOffset + VideoDuration + 1;
        } else if (LastRank - i > FirstRank) {
            GlobalOffset = GlobalOffset + VideoDuration;
        } else {
            if (CheckLost == true) {
                AddVideoProperty(LostVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
                AddVideoProperty(LostTextLayer, 1, LostTextLayer.outPoint - 0.6, 0.6, 2);
            }
            AddVideoProperty(NewVideoLayer, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            AddVideoProperty(NewVideoLayer_mask, 1, NewVideoLayer.outPoint - 0.6, 0.6, 2);
            GlobalOffset = GlobalOffset + VideoDuration;
        }
    }
    return GlobalOffset;
}

// Part 1
OpAudioLayer = AddLayer(MasterComposition, "op_audio", 5, 0);
AddAudioProperty(OpAudioLayer, 1, 0, 0.6, 1);
AddAudioProperty(OpAudioLayer, 1, 4.4, 0.6, 2);
OpLayer = AddLayer(MasterComposition, "spop", 5, 0);
AddVideoProperty(OpLayer, 1, 0, 0.6, 1);

// Part 2
GlobalRankOffset = AddRankPart(RankData, 4, false, false, 5);

// Part 3
EdAudioLayer = AddLayer(MasterComposition, "ed_audio", 6, GlobalRankOffset);
AddAudioProperty(EdAudioLayer, 1, GlobalRankOffset, 0.6, 1);
AddAudioProperty(EdAudioLayer, 1, GlobalRankOffset + 5.4, 0.6, 2);
EdLayer = AddLayer(MasterComposition, "sped", 6, GlobalRankOffset);
AddVideoProperty(EdLayer, 1, GlobalRankOffset, 0.6, 1);

MasterComposition.duration = GlobalRankOffset + 6;
app.project.save(File(".\\bilirank_100history.aep"));

MasterComposition.openInViewer();
