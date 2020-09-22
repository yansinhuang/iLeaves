import express from 'express';

const router = express.Router();

router.post('/helloworld', async(req, res) => {

    try {
        return res.send('helloworld!');
    } catch (err) {
        return res.status(400).send({
            message: `${err.message}`
        });
    }
});

export default router;