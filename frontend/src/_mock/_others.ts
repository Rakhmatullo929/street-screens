import {_mock} from './_mock';

export const _carouselsMembers = [...Array(6)].map((_, index) => ({
    id: _mock.id(index),
    name: _mock.fullName(index),
    role: _mock.role(index),
    avatarUrl: _mock.image.portrait(index),
}));

export const _addressBooks = [...Array(24)].map((_, index) => ({
    id: _mock.id(index),
    primary: index === 0,
    name: _mock.fullName(index),
    email: _mock.email(index + 1),
    fullAddress: _mock.fullAddress(index),
    phoneNumber: _mock.phoneNumber(index),
    company: _mock.companyName(index + 1),
    addressType: index === 0 ? 'Home' : 'Office',
}));

export const _contacts = [...Array(20)].map((_, index) => {
    const status =
        (index % 2 && 'online') || (index % 3 && 'offline') || (index % 4 && 'alway') || 'busy';

    return {
        id: _mock.id(index),
        status,
        role: _mock.role(index),
        email: _mock.email(index),
        name: _mock.fullName(index),
        phoneNumber: _mock.phoneNumber(index),
        lastActivity: _mock.time(index),
        avatarUrl: _mock.image.avatar(index),
        address: _mock.fullAddress(index),
    };
});

export const _notifications = [...Array(9)].map((_, index) => ({
    id: _mock.id(index),
    avatarUrl: [
        _mock.image.avatar(1),
        _mock.image.avatar(2),
        _mock.image.avatar(3),
        _mock.image.avatar(4),
        _mock.image.avatar(5),
        null,
        null,
        null,
        null,
        null,
    ][index],
    // типы и категории можно оставить как есть,
    // чтобы ничего не ломать в логике фильтров
    type: ['friend', 'project', 'file', 'tags', 'payment', 'order', 'chat', 'mail', 'delivery'][
        index
        ],
    category: [
        'Communication',
        'Project',
        'Campaign',
        'Screens',
        'Billing',
        'Booking',
        'Operations',
        'Communication',
        'Reports',
    ][index],
    isUnRead: _mock.boolean(index),
    createdAt: _mock.time(index),
    title:
        (index === 0 && `<p><strong>New advertiser</strong> joined StreetScreen</p>`) ||
        (index === 1 &&
            `<p><strong>New campaign</strong> created for <strong><a href='#'>Central Avenue LEDs</a></strong></p>`) ||
        (index === 2 &&
            `<p><strong>Creative</strong> approved for <strong><a href='#'>Summer Sale Loop</a></strong></p>`) ||
        (index === 3 &&
            `<p><strong>Screen status</strong> changed on <strong><a href='#'>Mall Entrance #3<a/></strong></p>`) ||
        (index === 4 &&
            `<p><strong>Invoice</strong> for your last campaign has been generated</p>`) ||
        (index === 5 && `<p>Your screen booking request has been confirmed</p>`) ||
        (index === 6 && `<p>Installation team scheduled setup for your new screen</p>`) ||
        (index === 7 && `<p>You have unread messages from media owners</p>`) ||
        (index === 8 && `<p>Your weekly performance report is ready</p>`) ||
        '',
}));

export const _mapContact = [
    {
        latlng: [33, 65],
        address: _mock.fullAddress(1),
        phoneNumber: _mock.phoneNumber(1),
    },
    {
        latlng: [-12.5, 18.5],
        address: _mock.fullAddress(2),
        phoneNumber: _mock.phoneNumber(2),
    },
];

export const _socials = [
    {
        value: 'facebook',
        name: 'FaceBook',
        icon: 'eva:facebook-fill',
        color: '#1877F2',
        path: 'https://www.facebook.com/streetscreen',
    },
    {
        value: 'instagram',
        name: 'Instagram',
        icon: 'ant-design:instagram-filled',
        color: '#E02D69',
        path: 'https://www.instagram.com/streetscreen.app',
    },
    {
        value: 'linkedin',
        name: 'Linkedin',
        icon: 'eva:linkedin-fill',
        color: '#007EBB',
        path: 'https://www.linkedin.com/company/streetscreen',
    },
    {
        value: 'twitter',
        name: 'Twitter',
        icon: 'eva:twitter-fill',
        color: '#00AAEC',
        path: 'https://twitter.com/streetscreen',
    },
];

export const _homePlans = [
    {
        license: 'Starter Network',
        commons: ['Up to 25 screens', 'Real-time status monitoring', 'Email support'],
        options: [
            'Basic content scheduling',
            'Simple performance reports',
            'Location overview map',
            'Standard file formats',
        ],
        icons: [
            '/assets/icons/home/ic_make_brand.svg',
            '/assets/icons/home/ic_design.svg',
            '/assets/icons/home/ic_development.svg',
        ],
    },
    {
        license: 'City Network',
        commons: ['Unlimited screens in one city', 'Live analytics', 'Priority support'],
        options: [
            'Advanced playlists & rules',
            'City heatmaps & reports',
            'Team roles & permissions',
            'API access (read-only)',
        ],
        icons: [
            '/assets/icons/home/ic_make_brand.svg',
            '/assets/icons/home/ic_design.svg',
            '/assets/icons/home/ic_development.svg',
        ],
    },
    {
        license: 'Enterprise Network',
        commons: ['Multi-city networks', 'Dedicated success manager', 'SLA support'],
        options: [
            'Custom integrations',
            'White-label dashboard',
            'Advanced billing & invoicing',
            'Full API access',
        ],
        icons: [
            '/assets/icons/home/ic_make_brand.svg',
            '/assets/icons/home/ic_design.svg',
            '/assets/icons/home/ic_development.svg',
        ],
    },
];

export const _testimonials = [
    {
        name: _mock.fullName(1),
        postedDate: _mock.time(1),
        ratingNumber: _mock.number.rating(1),
        avatarUrl: _mock.image.avatar(1),
        content: `StreetScreen helped us finally see all our city screens in one place and react to issues in minutes, not hours.`,
    },
    {
        name: _mock.fullName(2),
        postedDate: _mock.time(2),
        ratingNumber: _mock.number.rating(2),
        avatarUrl: _mock.image.avatar(2),
        content: `Мы запустили первую кампанию за один день. Интерфейс простой, а отчёты понятны даже маркетологам без тех. бэкграунда.`,
    },
    {
        name: _mock.fullName(3),
        postedDate: _mock.time(3),
        ratingNumber: _mock.number.rating(3),
        avatarUrl: _mock.image.avatar(3),
        content: `Удобно, что креативы, расписание и статистика по каждому экрану находятся в одном дашборде. Команда быстро отвечает на вопросы.`,
    },
    {
        name: _mock.fullName(4),
        postedDate: _mock.time(4),
        ratingNumber: _mock.number.rating(4),
        avatarUrl: _mock.image.avatar(4),
        content: `Мы подключили StreetScreen к существующей сети экранов и не меняли железо. Платформа просто взяла управление на себя.`,
    },
    {
        name: _mock.fullName(5),
        postedDate: _mock.time(5),
        ratingNumber: _mock.number.rating(5),
        avatarUrl: _mock.image.avatar(5),
        content: `Благодаря деталям по показам и частоте мы стали лучше аргументировать цены перед клиентами и увеличили загрузку сетки.`,
    },
    {
        name: _mock.fullName(6),
        postedDate: _mock.time(6),
        ratingNumber: _mock.number.rating(6),
        avatarUrl: _mock.image.avatar(6),
        content: `Мы используем StreetScreen как единую точку входа для агентств. Они сами бронируют слоты, а мы контролируем только сеть и качество.`,
    },
];
