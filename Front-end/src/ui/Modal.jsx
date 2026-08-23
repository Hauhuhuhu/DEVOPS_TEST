import { cloneElement, createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
// import { HiXMark } from "react-icons/hi2";
import { useOutsideClick } from "../hooks/useOutsideClick";

const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opens: opensWindowName }) {
  const { open } = useContext(ModalContext);

  return cloneElement(children, {
    onClick: () => open(opensWindowName),
  });
}

function Window({ children, name }) {
  const { openName, close } = useContext(ModalContext);
  const ref = useOutsideClick(close);

  if (name !== openName) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{
          zIndex: 1050,
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle"
        style={{ zIndex: 1055 }}
      >
        <div
          ref={ref}
          className="bg-white rounded shadow position-relative p-4"
          style={{
            minWidth: "500px",
            maxWidth: "90vw",
          }}
        >
          <button
            type="button"
            className="btn btn-light position-absolute top-0 end-0 m-3 border-0"
            onClick={close}
          >
            {/* <HiXMark size={24} /> */}
            X
          </button>

          <div>{cloneElement(children, { onCloseModal: close })}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
