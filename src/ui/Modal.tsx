import classNames from "classnames";
import React from "react";
import Modal, { Props } from "react-modal";

export type ModalProps = Props;

export default function CreateEntityDialog(
  props: Modal.Props & {
    title: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
  },
) {
  const { onRequestClose, title, children, footer } = props;
  return (
    <Modal
      {...props}
      className={classNames("modal", props.className)}
      overlayClassName="ModalOverlay"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onRequestClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">{footer}</div>
        </div>
      </div>
    </Modal>
  );
}
