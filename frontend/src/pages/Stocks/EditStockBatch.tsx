import { Modal, Form, Input, InputNumber, Row, Col } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { handleError } from "../../utils/handleError";
import { getChangedFormData } from "../../utils/changedData";
import { updatestockbatchservice } from "../../services/stockbatchservices";
import { ParticularProductStockBatch } from "../../types/types";

const EditStockBatch = ({
  selectedStockBatch,
  visible,
  onCancel,
  ProductBatchesData,
}: {
  selectedStockBatch: ParticularProductStockBatch;
  visible: boolean;
  onCancel: () => void;
  ProductBatchesData: () => void;
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedStockBatch && visible) {
      form.setFieldsValue({
        quantity: selectedStockBatch.quantity,
        purchase_price: selectedStockBatch.purchase_price,
        selling_price: selectedStockBatch.selling_price,
        manufacture_date: selectedStockBatch.manufacture_date || "",
        expiry_date: selectedStockBatch.expiry_date || "",
      });
    }
  }, [selectedStockBatch, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const batchID = selectedStockBatch.id;
      const formattedValues = {
        ...values,
      };
      const changedData = getChangedFormData(
        selectedStockBatch,
        formattedValues,
        null,
        "_file"
      );
      await updatestockbatchservice(batchID, changedData);
      toast.success("Stock batch updated successfully");
      ProductBatchesData();
      onCancel();
    } catch (err) {
      console.error("Error updating stock batch:", err);
      handleError(err);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={`Edit Stock Batch - ${selectedStockBatch?.id}`}
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Update"
      cancelText="Cancel"
      width={600}
    >
      <Form form={form} layout="vertical" name="edit_stock_batch">
        {/* Editable fields */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[
                { required: true, message: "Quantity is required" },
                {
                  type: "number",
                  min: 1,
                  message: "Quantity must be greater than 0",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="Enter quantity"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Purchase Price (₹)"
              name="purchase_price"
              rules={[
                { required: true, message: "Purchase price is required" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Selling Price (₹)"
              name="selling_price"
              rules={[{ required: true, message: "Selling price is required" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Manufacture Date"
              name="manufacture_date"
              rules={[
                { required: false },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const expiryDate = getFieldValue("expiry_date");
                    if (
                      value &&
                      expiryDate &&
                      new Date(value) > new Date(expiryDate)
                    ) {
                      return Promise.reject(
                        "Manufacture date must be before expiry date"
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                type="date"
                style={{ width: "100%" }}
                placeholder="Select manufacture date"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Expiry Date"
              name="expiry_date"
              rules={[
                { required: false },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const manufactureDate = getFieldValue("manufacture_date");
                    if (
                      value &&
                      manufactureDate &&
                      new Date(value) < new Date(manufactureDate)
                    ) {
                      return Promise.reject(
                        "Expiry date must be after manufacture date"
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                type="date"
                style={{ width: "100%" }}
                placeholder="Select expiry date"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditStockBatch;
