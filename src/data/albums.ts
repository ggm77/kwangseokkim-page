export interface Track {
    title: string;
    duration: number; // in seconds
    youtubeId: string;
}

export interface Album {
    id: string;
    title: string;
    subtitle: string;
    year: string;
    coverColor: string;
    textColor: string;
    accentColor: string;
    tracksSideA: Track[];
    tracksSideB: Track[];
}

export const ALBUMS: Album[] = [
    {
        id: "1",
        title: "김광석 1집",
        subtitle: "너에게 / 그대 웃음소리",
        year: "1989",
        coverColor: "#b24c3d",
        textColor: "#ffffff",
        accentColor: "#f39c12",
        tracksSideA: [
            { title: "너에게", duration: 243, youtubeId: "j5WoM_7CsGQ" },
            { title: "내 꿈", duration: 290, youtubeId: "j5WoM_7CsGQ" }
        ],
        tracksSideB: [
            { title: "그대 웃음소리", duration: 275, youtubeId: "j5WoM_7CsGQ" },
            { title: "슬픈 우연", duration: 225, youtubeId: "j5WoM_7CsGQ" }
        ]
    },
    {
        id: "2",
        title: "김광석 2집",
        subtitle: "사랑했지만 / 꽃",
        year: "1991",
        coverColor: "#2c3e50",
        textColor: "#ffffff",
        accentColor: "#1abc9c",
        tracksSideA: [
            { title: "사랑했지만", duration: 268, youtubeId: "gy31KUNcvk0" },
            { title: "꽃", duration: 278, youtubeId: "gy31KUNcvk0" }
        ],
        tracksSideB: [
            { title: "사랑이라는 이유로", duration: 230, youtubeId: "gy31KUNcvk0" },
            { title: "슬픈 노래", duration: 262, youtubeId: "gy31KUNcvk0" }
        ]
    },
    {
        id: "3",
        title: "김광석 3집",
        subtitle: "나의 노래 / 잊어야 한다는 마음으로",
        year: "1992",
        coverColor: "#27ae60",
        textColor: "#ffffff",
        accentColor: "#f1c40f",
        tracksSideA: [
            { title: "나의 노래", duration: 225, youtubeId: "RpAIP5A2BDI" },
            { title: "잊어야 한다는 마음으로", duration: 255, youtubeId: "RpAIP5A2BDI" }
        ],
        tracksSideB: [
            { title: "외사랑", duration: 310, youtubeId: "RpAIP5A2BDI" },
            { title: "나무", duration: 300, youtubeId: "RpAIP5A2BDI" }
        ]
    },
    {
        id: "4",
        title: "김광석 네번째",
        subtitle: "일어나 / 서른 즈음에",
        year: "1994",
        coverColor: "#7e5233",
        textColor: "#ffffff",
        accentColor: "#e67e22",
        tracksSideA: [
            { title: "일어나", duration: 270, youtubeId: "jr0quTBBphc" },
            { title: "바람이 불어오는 곳", duration: 202, youtubeId: "jr0quTBBphc" }
        ],
        tracksSideB: [
            { title: "서른 즈음에", duration: 283, youtubeId: "jr0quTBBphc" },
            { title: "너무 깊이 생각하지 마", duration: 235, youtubeId: "jr0quTBBphc" }
        ]
    },
    {
        id: "5",
        title: "다시 부르기 1",
        subtitle: "이등병의 편지 / 거리에서",
        year: "1993",
        coverColor: "#8e44ad",
        textColor: "#ffffff",
        accentColor: "#9b59b6",
        tracksSideA: [
            { title: "이등병의 편지", duration: 285, youtubeId: "19FlqiyplIs" },
            { title: "거리에서", duration: 345, youtubeId: "19FlqiyplIs" }
        ],
        tracksSideB: [
            { title: "광야에서", duration: 190, youtubeId: "19FlqiyplIs" },
            { title: "흐린 가을 하늘에 편지를 써", duration: 280, youtubeId: "19FlqiyplIs" }
        ]
    },
    {
        id: "6",
        title: "다시 부르기 2",
        subtitle: "그녀가 처음 울던 날 / 두 바퀴로 가는 자동차",
        year: "1995",
        coverColor: "#16a085",
        textColor: "#ffffff",
        accentColor: "#e74c3c",
        tracksSideA: [
            { title: "그녀가 처음 울던 날", duration: 175, youtubeId: "wwiWitiwdso" },
            { title: "두 바퀴로 가는 자동차", duration: 190, youtubeId: "wwiWitiwdso" }
        ],
        tracksSideB: [
            { title: "잊혀지는 것", duration: 255, youtubeId: "wwiWitiwdso" },
            { title: "바람과 나", duration: 230, youtubeId: "wwiWitiwdso" }
        ]
    }
];
