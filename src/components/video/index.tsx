'use client';
import { FC, useEffect, useRef, useState } from 'react';
import SpeechRecognition, {
	useSpeechRecognition,
} from 'react-speech-recognition';
import Webcam from 'react-webcam';
import { auth, db } from '../../services/firebase';
import {
	addDoc,
	collection,
	query,
	orderBy,
	onSnapshot,
	where,
	limit,
	doc,
	updateDoc,
} from 'firebase/firestore';
import InputField from '../input';
import Button from '../button';

const Video: FC = () => {
	const webcamRef = useRef<any>(undefined);
	const [t, setT] = useState<any>(undefined);
	const [expression, setExpression] = useState('');
	const [loadingTime, setLoadingTime] = useState(0);
	const { interimTranscript, listening } = useSpeechRecognition();
	const [room, setRoom] = useState<string | undefined>(undefined);
	const [roomValue, setRoomValue] = useState<string>('');
	const [messages, setMessages] = useState<any>([]);

	useEffect(() => {
		if (!room) return;
		const q = query(
			collection(db, 'messages'),
			where('room', '==', room),
			limit(50)
		);
		const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
			const fetchedMessages: any[] = [];
			QuerySnapshot.forEach((doc) => {
				fetchedMessages.push({ ...doc.data(), id: doc.id });
			});
			const sortedMessages = fetchedMessages.sort(
				(a, b) => a.createdAt - b.createdAt
			);
			setMessages(sortedMessages);
		});
		return () => unsubscribe();
	}, [room]);

	useEffect(() => {
		if (expression === '' || !room) return;
		const { uid, displayName } = auth.currentUser!;
		const message = messages.find((m: any) => m.name === displayName);
		if (!message) {
			addDoc(collection(db, 'messages'), {
				text: interimTranscript,
				name: displayName,
				room: 'test',
				expression,
				uid,
			});
		} else {
			const document = doc(db, 'messages', message.id);
			updateDoc(document, {
				text: interimTranscript === '' ? message.text : interimTranscript,
				expression,
			});
		}
	}, [expression, interimTranscript, messages, room]);

	useEffect(() => {
		if (!t && webcamRef.current !== null && !!room) {
			SpeechRecognition.startListening({ continuous: true });
			const imageSrc = webcamRef.current?.getScreenshot?.();
			if (imageSrc) {
				getExpression(imageSrc)
					.then((res) => setExpression(res[0].label))
					.catch((err) => {
						console.log(err);
					});
			}
			let timeout = setInterval(() => {
				if (loadingTime === 0) {
					const imageSrc = webcamRef.current?.getScreenshot?.();
					if (imageSrc) {
						getExpression(imageSrc).then((res) => setExpression(res[0].label));
					}
				} else {
					setLoadingTime((time) => (time - 2 > 0 ? time - 2 : 0));
				}
			}, 2000);
			setT(timeout);
		}
	}, [webcamRef, t, loadingTime, room]);

	return (
		<div className="flex flex-col h-full w-full items-center justify-start p-16">
			<div className="flex gap-4 items-center justify-center">
				<InputField
					label="Room name"
					name="room"
					placeholder="Room name"
					value={roomValue}
					onChange={(e) => setRoomValue(e.target.value)}
				/>
				<Button label="Set room" onClick={() => setRoom(roomValue)} />
			</div>
			<p className="italic text-xs text-white">
				If you get a 503 error, refresh again in 1-2 minutes, the model is
				loading. If you get a 429 error, then try again in 1 hour, the api
				reached its rate limit as we are using the free plan.
			</p>
			{room && (
				<>
					<Webcam
						className="w-80 h-80 "
						audio={false}
						ref={webcamRef}
						mirrored={true}
						screenshotFormat="image/jpeg"
					/>
					<div className="flex flex-row w-full h-full items-center justify-center flex-wrap p-16 gap-8">
						{messages.map((message: any, index: number) => {
							return (
								<div
									key={message.id}
									className="flex flex-col gap-2 w-56 h-56 border-2 border-blue-700 rounded-md items-center justify-center p-4"
								>
									<p className="w-full text-lg font-bold">{message.name}</p>
									<div className="flex w-1/2 h-1/2 items-center justify-center text-6xl">
										{getEmoji(message.expression)}
									</div>
									<p className="w-full">{message.text}</p>
								</div>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
};

const getEmoji = (expression: string) => {
	switch (expression) {
		case 'angry':
			return '😡';
		case 'happy':
			return '😁';
		case 'neutral':
			return '😐';
		case 'sad':
			return '🙁';
		case 'fear':
			return '😨';
		case 'surprise':
			return '🤯';
	}
};

async function getExpression(data: string) {
	return fetch(
		'https://api-inference.huggingface.co/models/trpakov/vit-face-expression',
		{
			headers: {
				Authorization: 'Bearer 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',
			},
			method: 'POST',
			body: dataURLtoFile(data, 'test.jpeg'),
		}
	).then(async (res) => {
		if (res.ok || res.status === 503) {
			return await res.json();
		}
		throw Error((await res.json()).error);
	});
}

function dataURLtoFile(dataurl: string, filename: string) {
	var arr = dataurl?.split(',') ?? [],
		mime = arr[0].match(/:(.*?);/)?.[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}
export default Video;
