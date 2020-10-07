import { nanoid } from 'nanoid';
import firebase from '../../config/fb';
import E2E from '../../Components/Utils/EndToEnd';
import ddb from '../../Components/Utils/Slug.model';
import 'firebase/firestore';

const db = firebase.firestore();

const getSlug = async (slug, dispatch) => new Promise((res, rej) => {
    db.collection('sharable_urls')
        .where('slug', '==', slug)
        .get()
        .then((doc) => {
            if (!doc.empty) {
                // dispatch({ type: 'UPDATE_SLUG', payload: { slug } });
                res(doc);
            } else res({ doc: false });
        })
        .catch((err) => {
            dispatch({ type: 'FETCH_ERROR', payload: { err } });
            rej(err, { doc: false });
        });
});

export const addSlug = () => (dispatch, getState) => {
    const slug = nanoid(7);
    const { uid, displayName, photoURL } = getState().authReducer.user;

    const obj = {
        slug,
        from: uid,
        displayName,
        photoURL,
        time: Date.now(),

    };

    const root = db.collection('sharable_urls');

    root
        .add(obj)
        .then(async (e) => {
            const e2e = new E2E();
            const { Publickey, PrivateKey } = e2e.generateKeys();

            console.log(PrivateKey, Publickey, slug);

            await ddb.slug.add({ id: slug, PrivateKey });
            console.log({ id: slug, PrivateKey });

            root.doc(e.id).collection('keys')
                .doc('key')
                .set({ Publickey })
                .then(() => {
                    dispatch({ type: 'WRITE_SUCCESS', payload: { slug } });
                })
                .catch((err) => console.log(err));
        })
        .catch((err) => {
            console.log(err);
            dispatch({ type: 'WRITE_ERROR', payload: { err } });
        });
};

export const fetchSlug = (slug) => async (dispatch) => {
    const doc = await getSlug(slug, dispatch);
    if (doc) { dispatch({ type: 'FETCH_SUCCESS', payload: { doc: doc.docs[0].data() } }); }
};

export const addChannel = (slug) => async (dispatch, getState) => {
    const { invite } = getState();
    const id = getState().authReducer.user.uid;

    const addChanneltoRoom = async (doc) => {
        const data = doc.data();

        if (data.from === id) {
            const err = {
                message: `
                You cannot add yourself. Please share this URL with your friend
                and ask him to accept invite`,
            };
            console.log('%c Error', 'color:red', err);
            dispatch({ type: 'CHANNEL_ERROR', payload: err });
            return;
        }

        const obj = {
            from: data.from,
            to: id,
            time: Date.now(),
            both: [data.from, id],
            generated: false,
            bobPublicKey: '',
            slug: data.slug,
        };

        try {
            const root = db.collection('sharable_urls');

            const secretKey = await root.doc(doc.id).collection('keys').doc('key').get();
            const e2e = new E2E();
            const bobPublicKey = e2e.generateSharedSecret(secretKey.data().Publickey);
            console.log('BobPublic', bobPublicKey);
            obj.bobPublicKey = bobPublicKey;

            const channelId = await db.collection('channel').add(obj);
            e2e.setChannel(channelId.id);

            await root.doc(doc.id).collection('keys').doc('key').delete();
            await root.doc(doc.id).delete();

            console.log('%c Created and Deleted ', 'color:green');
            dispatch({ type: 'CREATED_CHANNEL', payload: slug });
        } catch (err) {
            console.log(('Error', err));
            dispatch({ type: 'CHANNEL_ERROR', payload: err });
        }
    };

    if (invite) {
        const { doc } = invite;
        addChanneltoRoom(doc);
    } else {
        const doc = await getSlug(slug, dispatch);
        if (!doc.docs[0]) return;

        if (doc) addChanneltoRoom(doc.docs[0]);
    }
};
