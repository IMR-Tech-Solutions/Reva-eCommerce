import { Modal, Form, Select, Button } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import {
  updateposorderservice,
  cancelposorderservice,
} from "../../services/posorderservices";
import { POSOrderPayload } from "../../types/types";

const { Option } = Select;

const ORDER_STATUS_CHOICES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
];

const PAYMENT_STATUS_CHOICES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
];

const EditOrders = ({
  selectedOrder,
  visible,
  onCancel,
  fetchOrders,
}: {
  selectedOrder: POSOrderPayload;
  visible: boolean;
  onCancel: () => void;
  fetchOrders: () => void;
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedOrder && visible) {
      form.setFieldsValue({
        order_status: selectedOrder.order_status,
        payment_status: selectedOrder.payment_status,
      });
    }
  }, [selectedOrder, visible, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await updateposorderservice(selectedOrder.id!, {
        ...selectedOrder,
        order_status: values.order_status,
        payment_status: values.payment_status,
      });
      toast.success("Order updated successfully");
      fetchOrders();
      onCancel();
    } catch (err) {
      console.error("Error updating order:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setLoading(true);
      await cancelposorderservice(selectedOrder.id!);
      toast.success("Order cancelled successfully");
      fetchOrders();
      onCancel();
    } catch (err) {
      console.error("Error cancelling order:", err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Edit Order`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button
          key="cancelOrder"
          danger
          onClick={handleCancelOrder}
          loading={loading}
        >
          Cancel Order
        </Button>,
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="edit_order">
        <Form.Item
          label="Order Status"
          name="order_status"
          rules={[{ required: true, message: "Please select an order status" }]}
        >
          <Select placeholder="Select order status">
            {ORDER_STATUS_CHOICES.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Payment Status"
          name="payment_status"
          rules={[
            { required: true, message: "Please select a payment status" },
          ]}
        >
          <Select placeholder="Select payment status">
            {PAYMENT_STATUS_CHOICES.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditOrders;
