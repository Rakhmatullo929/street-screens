

export interface District {
    value: string;
    label: string;
}

export interface Region {
    value: string;
    label: string;
    districts: District[];
}

export interface GeoTarget {
    region: number | null;
    district: number[] | null;
}

export const REGIONS_DATA: Region[] = [
    {
        value: 'tashkent-city',
        label: 'Ташкент (город)',
        districts: [
            {value: 'chilanzar', label: 'Чиланзарский район'},
            {value: 'mirobod', label: 'Мирободский район'},
            {value: 'shayxontohur', label: 'Шайхантахурский район'},
            {value: 'yunusabad', label: 'Юнусабадский район'},
            {value: 'yakkasaroy', label: 'Яккасарайский район'},
            {value: 'uchtepa', label: 'Учтепинский район'},
            {value: 'bektemir', label: 'Бектемирский район'},
            {value: 'sergeli', label: 'Сергелийский район'},
            {value: 'yashnobod', label: 'Яшнабадский район'},
            {value: 'olmazor', label: 'Алмазарский район'},
            {value: 'mirzo-ulugbek', label: 'Мирзо-Улугбекский район'},
        ],
    },
    {
        value: 'tashkent-region',
        label: 'Ташкентская область',
        districts: [
            {value: 'tashkent-city-region', label: 'Ташкент (район)'},
            {value: 'angren', label: 'Ангрен'},
            {value: 'bekabad', label: 'Бекабад'},
            {value: 'chirchik', label: 'Чирчик'},
            {value: 'olmaliq', label: 'Алмалык'},
            {value: 'ohangaron', label: 'Ахангаран'},
            {value: 'yangiyul', label: 'Янгиюль'},
            {value: 'parkent', label: 'Паркент'},
            {value: 'pskent', label: 'Пскент'},
            {value: 'qibray', label: 'Кибрай'},
            {value: 'zangiota', label: 'Зангиата'},
        ],
    },
    {
        value: 'samarkand',
        label: 'Самарканд',
        districts: [
            {value: 'samarkand-city', label: 'Самарканд (город)'},
            {value: 'kattaqorgon', label: 'Каттакурган'},
            {value: 'jomboy', label: 'Джамбай'},
            {value: 'urgut', label: 'Ургут'},
            {value: 'ishtixon', label: 'Иштыхан'},
            {value: 'payariq', label: 'Пайарык'},
            {value: 'narpay', label: 'Нарпай'},
            {value: 'pastdargom', label: 'Пастдаргом'},
            {value: 'toyloq', label: 'Тайлак'},
        ],
    },
    {
        value: 'bukhara',
        label: 'Бухара',
        districts: [
            {value: 'bukhara-city', label: 'Бухара (город)'},
            {value: 'kagan', label: 'Каган'},
            {value: 'olot', label: 'Алат'},
            {value: 'karakul', label: 'Каракуль'},
            {value: 'gijduvon', label: 'Гиждуван'},
            {value: 'vobkent', label: 'Вабкент'},
            {value: 'peshku', label: 'Пешку'},
            {value: 'qorovulbozor', label: 'Караулбазар'},
            {value: 'romitan', label: 'Ромитан'},
            {value: 'shofirkon', label: 'Шафиркан'},
        ],
    },
    {
        value: 'andijan',
        label: 'Андижан',
        districts: [
            {value: 'andijan-city', label: 'Андижан (город)'},
            {value: 'asaka', label: 'Асака'},
            {value: 'xonobod', label: 'Ханабад'},
            {value: 'marhamat', label: 'Мархамат'},
            {value: 'baliqchi', label: 'Балыкчи'},
            {value: 'buloqboshi', label: 'Булакбаши'},
            {value: 'izboskan', label: 'Избаскан'},
            {value: 'jalolkuduk', label: 'Джалалкудук'},
            {value: 'oltinkol', label: 'Алтынкуль'},
            {value: 'paxtaobod', label: 'Пахтаабад'},
        ],
    },
    {
        value: 'namangan',
        label: 'Наманган',
        districts: [
            {value: 'namangan-city', label: 'Наманган (город)'},
            {value: 'chortoq', label: 'Чартак'},
            {value: 'chust', label: 'Чуст'},
            {value: 'kosonsoy', label: 'Касансай'},
            {value: 'mingbuloq', label: 'Мингбулак'},
            {value: 'norin', label: 'Норин'},
            {value: 'pop', label: 'Поп'},
            {value: 'toraqorgon', label: 'Туракурган'},
            {value: 'uchqorgon', label: 'Учкурган'},
            {value: 'uychi', label: 'Уйчи'},
        ],
    },
    {
        value: 'fergana',
        label: 'Фергана',
        districts: [
            {value: 'fergana-city', label: 'Фергана (город)'},
            {value: 'margilan', label: 'Маргилан'},
            {value: 'kokand', label: 'Коканд'},
            {value: 'quvasoy', label: 'Кувасай'},
            {value: 'beshariq', label: 'Бешарык'},
            {value: 'bogdod', label: 'Багдад'},
            {value: 'buvayda', label: 'Бувайда'},
            {value: 'danguara', label: 'Дангара'},
            {value: 'furqat', label: 'Фуркат'},
            {value: 'qushtepa', label: 'Куштепа'},
        ],
    },
    {
        value: 'khiva',
        label: 'Хива',
        districts: [
            {value: 'khiva-city', label: 'Хива (город)'},
            {value: 'urgench', label: 'Ургенч'},
            {value: 'khonqa', label: 'Ханка'},
            {value: 'bogot', label: 'Багат'},
            {value: 'gurlan', label: 'Гурлен'},
            {value: 'qoshkopir', label: 'Кошкупыр'},
            {value: 'shovot', label: 'Шават'},
            {value: 'urganch', label: 'Ургенч (район)'},
            {value: 'xiva', label: 'Хива (район)'},
            {value: 'xonqa', label: 'Ханка'},
        ],
    },
    {
        value: 'nukus',
        label: 'Нукус',
        districts: [
            {value: 'nukus-city', label: 'Нукус (город)'},
            {value: 'amudaryo', label: 'Амударё'},
            {value: 'beruniy', label: 'Беруний'},
            {value: 'chimboy', label: 'Чимбай'},
            {value: 'ellikqala', label: 'Элликкала'},
            {value: 'kegeyli', label: 'Кегейли'},
            {value: 'qonliko`l', label: 'Канлыкуль'},
            {value: 'qorao`zak', label: 'Караузяк'},
            {value: 'muynoq', label: 'Муйнак'},
            {value: 'nukus-district', label: 'Нукус (район)'},
        ],
    },
    {
        value: 'navoi',
        label: 'Навои',
        districts: [
            {value: 'navoi-city', label: 'Навои (город)'},
            {value: 'zarafshon', label: 'Зарафшан'},
            {value: 'konimex', label: 'Канимех'},
            {value: 'karmana', label: 'Кармана'},
            {value: 'qiziltepa', label: 'Кызылтепа'},
            {value: 'navbahor', label: 'Навбахор'},
            {value: 'nurota', label: 'Нурата'},
            {value: 'tomdi', label: 'Тамди'},
            {value: 'uchquduq', label: 'Учкудук'},
            {value: 'xatirchi', label: 'Хатырчи'},
        ],
    },
    {
        value: 'jizzakh',
        label: 'Джизак',
        districts: [
            {value: 'jizzakh-city', label: 'Джизак (город)'},
            {value: 'arnasoy', label: 'Арнасай'},
            {value: 'baxmal', label: 'Бахмаль'},
            {value: 'doshtobod', label: 'Даштабад'},
            {value: 'forish', label: 'Фориш'},
            {value: 'gallaorol', label: 'Галляарал'},
            {value: 'mirzachol', label: 'Мирзачоль'},
            {value: 'paxtakor', label: 'Пахтакор'},
            {value: 'yangiobod', label: 'Янгиабад'},
            {value: 'zomin', label: 'Зомин'},
        ],
    },
    {
        value: 'kashkadarya',
        label: 'Кашкадарья',
        districts: [
            {value: 'karshi', label: 'Карши'},
            {value: 'guzor', label: 'Гузар'},
            {value: 'kitob', label: 'Китаб'},
            {value: 'koson', label: 'Касан'},
            {value: 'mirishkor', label: 'Миришкор'},
            {value: 'muborak', label: 'Мубарек'},
            {value: 'nishon', label: 'Нишан'},
            {value: 'qarshi', label: 'Карши (район)'},
            {value: 'qamashi', label: 'Камаши'},
            {value: 'shahrisabz', label: 'Шахрисабз'},
        ],
    },
    {
        value: 'surkhandarya',
        label: 'Сурхандарья',
        districts: [
            {value: 'termez', label: 'Термез'},
            {value: 'angor', label: 'Ангор'},
            {value: 'boysun', label: 'Байсун'},
            {value: 'denov', label: 'Денау'},
            {value: 'jarqorgon', label: 'Джаркурган'},
            {value: 'qiziriq', label: 'Кызырык'},
            {value: 'qumqorgon', label: 'Кумкурган'},
            {value: 'muzrabot', label: 'Музработ'},
            {value: 'sariosiyo', label: 'Сариасия'},
            {value: 'sherobod', label: 'Шерабад'},
        ],
    },
    {
        value: 'sirdaryo',
        label: 'Сырдарья',
        districts: [
            {value: 'guliston', label: 'Гулистан'},
            {value: 'baxt', label: 'Бахт'},
            {value: 'boyovut', label: 'Баявут'},
            {value: 'guliston-district', label: 'Гулистан (район)'},
            {value: 'mirzaobod', label: 'Мирзаабад'},
            {value: 'oqoltin', label: 'Акалтын'},
            {value: 'sardoba', label: 'Сардоба'},
            {value: 'sayxun', label: 'Сайхун'},
            {value: 'xovos', label: 'Ховас'},
        ],
    },
];

export const getDistrictsByRegion = (regionValue: string): District[] => {
    const region = REGIONS_DATA.find((r) => r.value === regionValue);
    return region?.districts || [];
};

export const getRegionLabel = (regionValue: string): string => {
    const region = REGIONS_DATA.find((r) => r.value === regionValue);
    return region?.label || regionValue;
};

export const getDistrictLabel = (regionValue: string, districtValue: string): string => {
    const region = REGIONS_DATA.find((r) => r.value === regionValue);
    const district = region?.districts.find((d) => d.value === districtValue);
    return district?.label || districtValue;
};

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface RegionCoordinates {
    center: Coordinates;
    districts: Record<string, Coordinates>;
}

export const REGION_COORDINATES: Record<string, RegionCoordinates> = {
    'tashkent-city': {
        center: {latitude: 41.2995, longitude: 69.2401},
        districts: {
            chilanzar: {latitude: 41.2750, longitude: 69.2030},
            mirobod: {latitude: 41.3143, longitude: 69.2794},
            shayxontohur: {latitude: 41.3261, longitude: 69.2891},
            yunusabad: {latitude: 41.3330, longitude: 69.2890},
            yakkasaroy: {latitude: 41.2889, longitude: 69.2742},
            uchtepa: {latitude: 41.2906, longitude: 69.1583},
            bektemir: {latitude: 41.2078, longitude: 69.3342},
            sergeli: {latitude: 41.2267, longitude: 69.2242},
            yashnobod: {latitude: 41.2889, longitude: 69.3244},
            olmazor: {latitude: 41.3456, longitude: 69.2100},
            'mirzo-ulugbek': {latitude: 41.3389, longitude: 69.3347},
        },
    },
    'tashkent-region': {
        center: {latitude: 41.0228, longitude: 69.6211},
        districts: {
            'tashkent-city-region': {latitude: 41.0228, longitude: 69.6211},
            angren: {latitude: 41.0167, longitude: 70.1436},
            bekabad: {latitude: 40.2178, longitude: 69.2092},
            chirchik: {latitude: 41.4692, longitude: 69.5825},
            olmaliq: {latitude: 40.8456, longitude: 69.5989},
            ohangaron: {latitude: 41.0072, longitude: 70.1261},
            yangiyul: {latitude: 41.1125, longitude: 69.0472},
            parkent: {latitude: 41.2922, longitude: 69.6722},
            pskent: {latitude: 41.0364, longitude: 69.5344},
            qibray: {latitude: 41.3703, longitude: 69.4739},
            zangiota: {latitude: 41.2644, longitude: 69.7350},
        },
    },
    samarkand: {
        center: {latitude: 39.6547, longitude: 66.9597},
        districts: {
            'samarkand-city': {latitude: 39.6547, longitude: 66.9597},
            kattaqorgon: {latitude: 39.9000, longitude: 66.2500},
            jomboy: {latitude: 39.7042, longitude: 67.0636},
            urgut: {latitude: 39.4094, longitude: 67.2617},
            ishtixon: {latitude: 39.9500, longitude: 66.9333},
            payariq: {latitude: 39.8117, longitude: 66.7625},
            narpay: {latitude: 39.5617, longitude: 67.6378},
            pastdargom: {latitude: 39.7242, longitude: 67.6878},
            toyloq: {latitude: 39.5167, longitude: 67.1167},
        },
    },
    bukhara: {
        center: {latitude: 39.7747, longitude: 64.4286},
        districts: {
            'bukhara-city': {latitude: 39.7747, longitude: 64.4286},
            kagan: {latitude: 39.7167, longitude: 64.5500},
            olot: {latitude: 40.2667, longitude: 64.4167},
            karakul: {latitude: 39.5333, longitude: 63.8500},
            gijduvon: {latitude: 40.1000, longitude: 64.6833},
            vobkent: {latitude: 40.0333, longitude: 64.5167},
            peshku: {latitude: 40.0000, longitude: 64.1667},
            qorovulbozor: {latitude: 40.5167, longitude: 63.6667},
            romitan: {latitude: 39.9333, longitude: 64.3667},
            shofirkon: {latitude: 39.7500, longitude: 64.5000},
        },
    },
    andijan: {
        center: {latitude: 40.7831, longitude: 72.3441},
        districts: {
            'andijan-city': {latitude: 40.7831, longitude: 72.3441},
            asaka: {latitude: 40.6431, longitude: 72.2381},
            xonobod: {latitude: 40.8167, longitude: 72.0833},
            marhamat: {latitude: 40.4667, longitude: 72.3167},
            baliqchi: {latitude: 40.8667, longitude: 72.1333},
            buloqboshi: {latitude: 40.6167, longitude: 71.9833},
            izboskan: {latitude: 40.9000, longitude: 72.2500},
            jalolkuduk: {latitude: 40.9333, longitude: 72.5833},
            oltinkol: {latitude: 40.7500, longitude: 72.1667},
            paxtaobod: {latitude: 40.3000, longitude: 72.0833},
        },
    },
    namangan: {
        center: {latitude: 40.9983, longitude: 71.6726},
        districts: {
            'namangan-city': {latitude: 40.9983, longitude: 71.6726},
            chortoq: {latitude: 41.0833, longitude: 71.2167},
            chust: {latitude: 41.0000, longitude: 71.2333},
            kosonsoy: {latitude: 41.2167, longitude: 71.5500},
            mingbuloq: {latitude: 41.2000, longitude: 71.6833},
            norin: {latitude: 41.0167, longitude: 72.0000},
            pop: {latitude: 40.8667, longitude: 71.1167},
            toraqorgon: {latitude: 40.8333, longitude: 71.6167},
            uchqorgon: {latitude: 40.7667, longitude: 72.0000},
            uychi: {latitude: 41.1833, longitude: 71.9667},
        },
    },
    fergana: {
        center: {latitude: 40.3864, longitude: 71.7864},
        districts: {
            'fergana-city': {latitude: 40.3864, longitude: 71.7864},
            margilan: {latitude: 40.4667, longitude: 71.7167},
            kokand: {latitude: 40.5283, longitude: 70.9428},
            quvasoy: {latitude: 40.2958, longitude: 72.0328},
            beshariq: {latitude: 40.4333, longitude: 70.6167},
            bogdod: {latitude: 40.5333, longitude: 71.1833},
            buvayda: {latitude: 40.8333, longitude: 71.5833},
            danguara: {latitude: 40.7333, longitude: 71.8500},
            furqat: {latitude: 40.5500, longitude: 71.3500},
            qushtepa: {latitude: 40.0000, longitude: 72.5833},
        },
    },
    khiva: {
        center: {latitude: 41.3775, longitude: 60.3644},
        districts: {
            'khiva-city': {latitude: 41.3775, longitude: 60.3644},
            urgench: {latitude: 41.5500, longitude: 60.6333},
            khonqa: {latitude: 41.7333, longitude: 60.8667},
            bogot: {latitude: 41.1333, longitude: 61.2167},
            gurlan: {latitude: 41.8500, longitude: 60.3833},
            qoshkopir: {latitude: 41.5167, longitude: 60.3500},
            shovot: {latitude: 41.6667, longitude: 60.3167},
            urganch: {latitude: 41.5500, longitude: 60.6333},
            xiva: {latitude: 41.3775, longitude: 60.3644},
            xonqa: {latitude: 41.7333, longitude: 60.8667},
        },
    },
    nukus: {
        center: {latitude: 42.4531, longitude: 59.6103},
        districts: {
            'nukus-city': {latitude: 42.4531, longitude: 59.6103},
            amudaryo: {latitude: 42.3500, longitude: 59.9167},
            beruniy: {latitude: 41.6833, longitude: 60.7500},
            chimboy: {latitude: 42.9333, longitude: 59.7833},
            ellikqala: {latitude: 43.1000, longitude: 59.3833},
            kegeyli: {latitude: 43.1667, longitude: 58.5667},
            'qonliko`l': {latitude: 43.5667, longitude: 58.4833},
            'qorao`zak': {latitude: 43.2000, longitude: 59.0333},
            muynoq: {latitude: 43.7667, longitude: 59.0333},
            'nukus-district': {latitude: 42.4531, longitude: 59.6103},
        },
    },
    navoi: {
        center: {latitude: 40.0844, longitude: 65.3792},
        districts: {
            'navoi-city': {latitude: 40.0844, longitude: 65.3792},
            zarafshon: {latitude: 41.5767, longitude: 64.2042},
            konimex: {latitude: 40.4833, longitude: 65.7833},
            karmana: {latitude: 40.1167, longitude: 65.5500},
            qiziltepa: {latitude: 40.0333, longitude: 66.8500},
            navbahor: {latitude: 40.3833, longitude: 65.2500},
            nurota: {latitude: 40.5667, longitude: 65.6833},
            tomdi: {latitude: 41.7167, longitude: 64.6167},
            uchquduq: {latitude: 42.1500, longitude: 63.5667},
            xatirchi: {latitude: 40.2833, longitude: 66.4500},
        },
    },
    jizzakh: {
        center: {latitude: 40.1158, longitude: 67.8422},
        districts: {
            'jizzakh-city': {latitude: 40.1158, longitude: 67.8422},
            arnasoy: {latitude: 40.2833, longitude: 68.3333},
            baxmal: {latitude: 40.6000, longitude: 67.7333},
            doshtobod: {latitude: 39.9667, longitude: 66.8667},
            forish: {latitude: 40.6000, longitude: 67.9833},
            gallaorol: {latitude: 40.0667, longitude: 68.3833},
            mirzachol: {latitude: 40.6167, longitude: 68.5167},
            paxtakor: {latitude: 40.3167, longitude: 68.5333},
            yangiobod: {latitude: 40.2833, longitude: 67.7000},
            zomin: {latitude: 39.9667, longitude: 68.3667},
        },
    },
    kashkadarya: {
        center: {latitude: 38.8606, longitude: 65.7894},
        districts: {
            karshi: {latitude: 38.8606, longitude: 65.7894},
            guzor: {latitude: 38.6167, longitude: 66.2500},
            kitob: {latitude: 39.0667, longitude: 66.8833},
            koson: {latitude: 39.0333, longitude: 65.6167},
            mirishkor: {latitude: 38.6500, longitude: 66.8500},
            muborak: {latitude: 38.9167, longitude: 66.0833},
            nishon: {latitude: 38.6667, longitude: 66.6833},
            qarshi: {latitude: 38.8606, longitude: 65.7894},
            qamashi: {latitude: 38.8333, longitude: 65.4167},
            shahrisabz: {latitude: 39.0500, longitude: 66.8333},
        },
    },
    surkhandarya: {
        center: {latitude: 37.2242, longitude: 67.2783},
        districts: {
            termez: {latitude: 37.2242, longitude: 67.2783},
            angor: {latitude: 37.8833, longitude: 67.5167},
            boysun: {latitude: 38.2000, longitude: 67.2167},
            denov: {latitude: 38.2667, longitude: 67.9000},
            jarqorgon: {latitude: 37.4667, longitude: 67.4333},
            qiziriq: {latitude: 37.7667, longitude: 68.1167},
            qumqorgon: {latitude: 37.8333, longitude: 67.5833},
            muzrabot: {latitude: 37.3667, longitude: 68.0167},
            sariosiyo: {latitude: 37.9667, longitude: 67.0167},
            sherobod: {latitude: 37.7167, longitude: 67.0000},
        },
    },
    sirdaryo: {
        center: {latitude: 40.4983, longitude: 68.7842},
        districts: {
            guliston: {latitude: 40.4983, longitude: 68.7842},
            baxt: {latitude: 40.5833, longitude: 68.5500},
            boyovut: {latitude: 40.8667, longitude: 68.8333},
            'guliston-district': {latitude: 40.4983, longitude: 68.7842},
            mirzaobod: {latitude: 40.3667, longitude: 68.4833},
            oqoltin: {latitude: 40.8500, longitude: 68.4667},
            sardoba: {latitude: 40.6833, longitude: 68.2667},
            sayxun: {latitude: 40.9000, longitude: 68.6833},
            xovos: {latitude: 40.3000, longitude: 68.9167},
        },
    },
};

