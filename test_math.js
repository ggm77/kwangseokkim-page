const sideA = [
    { title: "너에게", duration: 241, startTime: 0, youtubeId: "j5WoM_7CsGQ" },
    { title: "내 꿈", duration: 207, startTime: 241, youtubeId: "j5WoM_7CsGQ" },
    { title: "안녕 친구여", duration: 201, startTime: 1004, youtubeId: "j5WoM_7CsGQ" }
];
const sideB = [
    { title: "내 마음의 문을 열어줘", duration: 194, startTime: 1205, youtubeId: "j5WoM_7CsGQ" },
    { title: "아스팔트 열기 속에서", duration: 240, startTime: 2168, youtubeId: "j5WoM_7CsGQ" }
];

const currentSide = "A";
const currentTime = 0; // Flip from beginning of Side A

const startA = sideA[0].startTime; // 0
const endA = sideA[sideA.length - 1].startTime + sideA[sideA.length - 1].duration; // 1205
const durA = endA - startA; // 1205

const startB = sideB[0].startTime; // 1205
const endB = sideB[sideB.length - 1].startTime + sideB[sideB.length - 1].duration; // 2408
const durB = endB - startB; // 1203

const physicalSideLength = Math.max(durA, durB); // 1205

const oldStart = currentSide === "A" ? startA : startB; // 0
const oldElapsed = Math.max(0, Math.min(currentTime - oldStart, physicalSideLength)); // 0

const newElapsed = physicalSideLength - oldElapsed; // 1205
const side = "B";
const newStart = side === "A" ? startA : startB; // 1205
let newTime = newStart + newElapsed; // 1205 + 1205 = 2410

const newTracks = side === "A" ? sideA : sideB;
const newEnd = newTracks[newTracks.length - 1].startTime + newTracks[newTracks.length - 1].duration; // 2408

if (newTime > newEnd) {
    newTime = newEnd; // 2408
}

let newIndex = newTracks.length - 1;
for (let i = 0; i < newTracks.length; i++) {
    if (newTime >= newTracks[i].startTime && newTime < newTracks[i].startTime + newTracks[i].duration) {
        newIndex = i;
        break;
    }
}
console.log({newTime, newIndex});
