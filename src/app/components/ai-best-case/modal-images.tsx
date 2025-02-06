"use client";

import { Modal } from "antd";

interface Props {
    open: boolean;
}

const ModalImages = ({ open }: Props) => {
    return (
        <>
            <Modal open={open}>
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </>
    );
};

export default ModalImages;
