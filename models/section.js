import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const sectionSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        descriptionF: {
            type: String,
            required: true
        },
        descriptionK: {
            type: String,
            required: true
        },
        descriptionS: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default model('Section', sectionSchema);