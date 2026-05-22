export interface Track {
    title: string;
    duration: number; // in seconds
    startTime: number; // in seconds
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
    imageFront: string;
    imageBack: string;
    coverScale?: number;
    coverOffsetY?: string;
    tracksSideA: Track[];
    tracksSideB: Track[];
}

export const ALBUMS: Album[] = [
    {
        id: "1",
        title: "1집: 김광석 1",
        subtitle: "너에게 / 내 꿈",
        year: "1989",
        coverColor: "#996633",
        textColor: "#ffffff",
        accentColor: "#435f4e",
        imageFront: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_CtuoYPwe_4fb363c07863a1d937b86358f2f410f9427bfb9d.jpg",
        imageBack: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_IaX5bDQ7_2fc68a06c68195087479ed2b4f56cd83a73ed428.jpg",
        coverScale: 1.34,
        tracksSideA: [
            { title: "너에게", duration: 241, startTime: 0, youtubeId: "j5WoM_7CsGQ" },
            { title: "내 꿈", duration: 207, startTime: 241, youtubeId: "j5WoM_7CsGQ" },
            { title: "그대 웃음소리", duration: 272, startTime: 448, youtubeId: "j5WoM_7CsGQ" },
            { title: "슬픈 우연", duration: 284, startTime: 720, youtubeId: "j5WoM_7CsGQ" },
            { title: "안녕 친구여", duration: 201, startTime: 1004, youtubeId: "j5WoM_7CsGQ" }
        ],
        tracksSideB: [
            { title: "내 마음의 문을 열어줘", duration: 194, startTime: 1205, youtubeId: "j5WoM_7CsGQ" },
            { title: "기다려줘", duration: 241, startTime: 1399, youtubeId: "j5WoM_7CsGQ" },
            { title: "창(窓)", duration: 311, startTime: 1640, youtubeId: "j5WoM_7CsGQ" },
            { title: "그건 너의 자신을 사랑하지 않는 때문이야", duration: 217, startTime: 1951, youtubeId: "j5WoM_7CsGQ" },
            { title: "아스팔트 열기 속에서", duration: 240, startTime: 2168, youtubeId: "j5WoM_7CsGQ" }
        ]
    },
    {
        id: "2",
        title: "2집: 김광석 2nd",
        subtitle: "사랑했지만 / 꽃",
        year: "1991",
        coverColor: "#435f4e",
        textColor: "#ffffff",
        accentColor: "#996633",
        imageFront: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_oJrRZGFC_bb3c65729325f40e1581e2e68622deb957c74beb.jpg",
        imageBack: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_pxFGatwR_5b0f7d0f37f0d666ed21110c6aa1bbb0bf3e8071.jpg",
        coverScale: 1.38,
        tracksSideA: [
            { title: "사랑했지만", duration: 266, startTime: 0, youtubeId: "gy31KUNcvk0" },
            { title: "꽃", duration: 271, startTime: 266, youtubeId: "gy31KUNcvk0" },
            { title: "사랑이라는 이유로", duration: 226, startTime: 537, youtubeId: "gy31KUNcvk0" },
            { title: "마음의 이야기", duration: 257, startTime: 763, youtubeId: "gy31KUNcvk0" },
            { title: "너 하나뿐임을", duration: 258, startTime: 1020, youtubeId: "gy31KUNcvk0" }
        ],
        tracksSideB: [
            { title: "슬픈 노래", duration: 271, startTime: 1278, youtubeId: "gy31KUNcvk0" },
            { title: "그날들", duration: 332, startTime: 1549, youtubeId: "gy31KUNcvk0" },
            { title: "추억", duration: 175, startTime: 1881, youtubeId: "gy31KUNcvk0" },
            { title: "마음속의 풍경", duration: 249, startTime: 2056, youtubeId: "gy31KUNcvk0" },
            { title: "다시 아침", duration: 240, startTime: 2305, youtubeId: "gy31KUNcvk0" }
        ]
    },
    {
        id: "3",
        title: "3집: 김광석 3번째 노래모음",
        subtitle: "나의 노래 / 잊어야 한다는 마음으로",
        year: "1992",
        coverColor: "#996633",
        textColor: "#ffffff",
        accentColor: "#435f4e",
        imageFront: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_oFzhUCGf_7ad2658ce5ada83dbe20b4562912a0f575afe5ea.jpg",
        imageBack: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_ilVZ5C6f_8ed25d1342e9b7d2fa154cc230389327d899d650.jpg",
        coverScale: 1.36,
        tracksSideA: [
            { title: "序 자장가", duration: 56, startTime: 0, youtubeId: "RpAIP5A2BDI" },
            { title: "나의 노래", duration: 233, startTime: 56, youtubeId: "RpAIP5A2BDI" },
            { title: "잊어야 한다는 마음으로", duration: 256, startTime: 289, youtubeId: "RpAIP5A2BDI" },
            { title: "나른한 오후", duration: 267, startTime: 545, youtubeId: "RpAIP5A2BDI" },
            { title: "외사랑", duration: 318, startTime: 812, youtubeId: "RpAIP5A2BDI" }
        ],
        tracksSideB: [
            { title: "나무", duration: 322, startTime: 1130, youtubeId: "RpAIP5A2BDI" },
            { title: "기대어 앉은 오후에는", duration: 227, startTime: 1452, youtubeId: "RpAIP5A2BDI" },
            { title: "그대가 기억하는 내 모습", duration: 225, startTime: 1679, youtubeId: "RpAIP5A2BDI" },
            { title: "행복의 문", duration: 279, startTime: 1904, youtubeId: "RpAIP5A2BDI" },
            { title: "結 자장가", duration: 180, startTime: 2183, youtubeId: "RpAIP5A2BDI" }
        ]
    },
    {
        id: "4",
        title: "4집: 김광석 네번째",
        subtitle: "일어나 / 서른 즈음에",
        year: "1994",
        coverColor: "#435f4e",
        textColor: "#ffffff",
        accentColor: "#996633",
        imageFront: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_h6uIJcFO_cdf9089794cdc2aaca3fa85ed63ff61fa45460f1.jpg",
        imageBack: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_UF7nPHu4_36587731b6de579038832360db3381d9719578ce.jpg",
        coverScale: 1.34,
        tracksSideA: [
            { title: "일어나", duration: 271, startTime: 0, youtubeId: "jr0quTBBphc" },
            { title: "바람이 불어오는 곳", duration: 204, startTime: 271, youtubeId: "jr0quTBBphc" },
            { title: "너무 깊이 생각하지마", duration: 236, startTime: 475, youtubeId: "jr0quTBBphc" },
            { title: "회귀", duration: 215, startTime: 711, youtubeId: "jr0quTBBphc" },
            { title: "너무 아픈 사랑은 사랑이 아니었음을", duration: 371, startTime: 926, youtubeId: "jr0quTBBphc" }
        ],
        tracksSideB: [
            { title: "서른 즈음에", duration: 283, startTime: 1297, youtubeId: "jr0quTBBphc" },
            { title: "혼자 남은밤", duration: 280, startTime: 1580, youtubeId: "jr0quTBBphc" },
            { title: "끊어진 길", duration: 210, startTime: 1860, youtubeId: "jr0quTBBphc" },
            { title: "맑고 향기롭게", duration: 221, startTime: 2070, youtubeId: "jr0quTBBphc" },
            { title: "자유롭게", duration: 240, startTime: 2291, youtubeId: "jr0quTBBphc" }
        ]
    },
    {
        id: "5",
        title: "김광석 다시 부르기 1",
        subtitle: "이등병의 편지 / 거리에서",
        year: "1993",
        coverColor: "#996633",
        textColor: "#ffffff",
        accentColor: "#435f4e",
        imageFront: "https://kimkwangseok.com/data/file/gallery/ef6598181a1dc339218f7d95462b7cde_W43dzUDk_fd4e335f17d20dd890e9c0fb28e373072592fa77.jpg",
        imageBack: "https://kimkwangseok.com/data/file/gallery/ef6598181a1dc339218f7d95462b7cde_sTt3cR8Z_26da0518d37cacf70d5024ec56a3c5f0471bd2c6.jpg",
        coverScale: 1.34,
        tracksSideA: [
            { title: "이등병의 편지", duration: 289, startTime: 0, youtubeId: "19FlqiyplIs" },
            { title: "사랑이라는 이유로", duration: 235, startTime: 289, youtubeId: "19FlqiyplIs" },
            { title: "사랑했지만", duration: 268, startTime: 524, youtubeId: "19FlqiyplIs" },
            { title: "그날들", duration: 323, startTime: 792, youtubeId: "19FlqiyplIs" },
            { title: "너에게", duration: 255, startTime: 1115, youtubeId: "19FlqiyplIs" },
            { title: "슬픈 노래", duration: 255, startTime: 1370, youtubeId: "19FlqiyplIs" }
        ],
        tracksSideB: [
            { title: "거리에서", duration: 345, startTime: 1625, youtubeId: "19FlqiyplIs" },
            { title: "말하지 못한 내 사랑", duration: 279, startTime: 1970, youtubeId: "19FlqiyplIs" },
            { title: "그루터기", duration: 226, startTime: 2249, youtubeId: "19FlqiyplIs" },
            { title: "기다려줘", duration: 242, startTime: 2475, youtubeId: "19FlqiyplIs" },
            { title: "흐린 가을 하늘에 편지를 써", duration: 285, startTime: 2717, youtubeId: "19FlqiyplIs" },
            { title: "그대 웃음 소리", duration: 251, startTime: 3002, youtubeId: "19FlqiyplIs" },
            { title: "광야에서", duration: 240, startTime: 3253, youtubeId: "19FlqiyplIs" }
        ]
    },
    {
        id: "6",
        title: "김광석 다시 부르기 2",
        subtitle: "그녀가 처음 울던 날 / 두 바퀴로 가는 자동차",
        year: "1995",
        coverColor: "#435f4e",
        textColor: "#ffffff",
        accentColor: "#996633",
        imageFront: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_LmQkxK3n_cd0c978af7c70db04616ac9a0489debdc4a10c22.jpg",
        imageBack: "https://kimkwangseok.com/data/file/gallery/d037fb2c1c053b73cbfad02704046b42_szBCAK9k_af1c8e94692ec60c5d4b426702f4dc8d1a28a9a9.jpg",
        coverScale: 1.6,
        coverOffsetY: "5%",
        tracksSideA: [
            { title: "바람과 나", duration: 237, startTime: 0, youtubeId: "wwiWitiwdso" },
            { title: "그녀가 처음 울던 날", duration: 176, startTime: 237, youtubeId: "wwiWitiwdso" },
            { title: "두바퀴로 가는 자동차", duration: 195, startTime: 413, youtubeId: "wwiWitiwdso" },
            { title: "잊혀지는 것", duration: 258, startTime: 608, youtubeId: "wwiWitiwdso" },
            { title: "불행아", duration: 223, startTime: 866, youtubeId: "wwiWitiwdso" }
        ],
        tracksSideB: [
            { title: "어느 60대 노부부 이야기", duration: 268, startTime: 1089, youtubeId: "wwiWitiwdso" },
            { title: "내 사람이여", duration: 354, startTime: 1357, youtubeId: "wwiWitiwdso" },
            { title: "변해가네", duration: 275, startTime: 1711, youtubeId: "wwiWitiwdso" },
            { title: "새장속의 친구", duration: 298, startTime: 1986, youtubeId: "wwiWitiwdso" },
            { title: "나의 노래", duration: 195, startTime: 2284, youtubeId: "wwiWitiwdso" },
            { title: "너무 아픈 사랑은 사랑이 아니었음을", duration: 300, startTime: 2479, youtubeId: "wwiWitiwdso" }
        ]
    }
];
