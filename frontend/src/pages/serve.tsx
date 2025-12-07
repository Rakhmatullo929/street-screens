import {useApiQuery} from 'src/hooks/use-api-query';
import {useParams} from 'react-router-dom';
import {useEffect, useMemo, useRef, useState} from 'react';

export default function ServePage() {
    const {id} = useParams();
    const [playingVideoIndex, setPlayingVideoIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const {data, loading} = useApiQuery({
        url: `main/screen-videos/${id}/`,
        enabled: true,
    });

    const items = useMemo(() => data?.results ?? [], [data]);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    const handleEnded = () => {
        if (playingVideoIndex < items.length - 1) {
            setPlayingVideoIndex((i) => i + 1);
        } else {
            setPlayingVideoIndex(0);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'black',
                    color: 'white',
                }}
            >
                Loading...
            </div>
        );
    }

    const currentItem = items[playingVideoIndex];
    const src = currentItem?.video;

    const qrSrc =
        currentItem?.qr_code ||
        (currentItem?.qr_code_url ? `https://${currentItem.qr_code_url}` : null);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100vw',
                    height: '100vh',
                }}
            >
                <video
                    ref={videoRef}
                    key={src}
                    src={src}
                    onEnded={handleEnded}
                    autoPlay
                    controls
                    muted
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        background: 'black',
                    }}
                    controlsList="nodownload"
                    disablePictureInPicture
                >
                    <track default kind="captions" srcLang="uz" src="ads"/>
                </video>

                {qrSrc && (
                    <a
                        href={currentItem?.ad_link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            position: 'absolute',
                            top: 24,
                            right: 24,
                        }}
                    >
                        <img
                            src={qrSrc}
                            alt="QR code"
                            style={{
                                width: 120,
                                height: 120,
                                objectFit: 'contain',
                                borderRadius: 8,
                                background: 'white',
                                padding: 8,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                            }}
                        />
                    </a>
                )}
            </div>
        </div>
    );
}
