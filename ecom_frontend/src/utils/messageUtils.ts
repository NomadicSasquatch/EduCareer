// messageUtils.ts
import { message } from 'antd';

const showSuccessMessage = (content: string) => {
  message.success(content);
};

const showErrorMessage = (content: string) => {
  message.error(content);
};

const showInfoMessage = (content: string) => {
  message.info(content);
};

export { showSuccessMessage, showErrorMessage, showInfoMessage };
