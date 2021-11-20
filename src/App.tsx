import React, { useState } from "react";
import moment from "moment";
import {
  FormItem,
  Editable,
  Input,
  Select,
  Radio,
  DatePicker,
  ArrayItems,
  Space,
  NumberPicker,
  ArrayTable,
} from "@formily/antd";
import { createForm, Field } from "@formily/core";
import { FormProvider, createSchemaField } from "@formily/react";
import {
  ConfigProvider,
  Card,
  Form,
  InputNumber,
  Button,
  Modal,
  notification,
  Dropdown,
  Menu,
} from "antd";
import locale from "antd/lib/locale/zh_CN";
import "moment/locale/zh-cn";
import useLocalStorage from "./useLocalStorage";
import "./App.css";

const rule = (money: number) => {
  let sum = 0;
  if (money > 50000000) {
    money -= 50000000;
    sum += (money * 0.5) / 100;
    money = 50000000;
  }
  if (money > 50000000) {
    money -= 20000000;
    sum += (money * 1) / 100;
    money = 20000000;
  }
  if (money > 10000000) {
    money -= 10000000;
    sum += (money * 1.2) / 100;
    money = 10000000;
  }
  if (money > 5000000) {
    money -= 5000000;
    sum += (money * 2) / 100;
    money = 5000000;
  }
  if (money > 1000000) {
    money -= 1000000;
    sum += (money * 3) / 100;
    money = 1000000;
  }
  if (money > 500000) {
    money -= 500000;
    sum += (money * 4) / 100;
    money = 500000;
  }
  if (money > 100000) {
    money -= 100000;
    sum += (money * 4.2) / 100;
    money = 100000;
  }
  if (money > 0) {
    sum += 5000;
  }
  return sum.toFixed(2);
};
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Editable,
    DatePicker,
    Space,
    Radio,
    Input,
    Select,
    ArrayItems,
    ArrayTable,
    NumberPicker,
  },
  scope: {
    computeRate: (field: Field) => {
      const date = field.query(".date").value();
      const money = field.query(".money").value();
      const backMoney = field.query(".backMoney").value();
      const rate = field.query(".rate").value();
      const cyc = field.query(".cyc").value();
      if (!(date && money && cyc)) {
        return;
      }
      const [start, end] = date;
      const diff = moment(end).diff(moment(start), "days");
      const accrual = money * (diff * (rate / cyc / 100));
      if (backMoney) {
        field.value = `还本付息之后：${(money + accrual - backMoney)?.toFixed(
          2
        )}`;
      } else {
        field.value = `${money}(本金)+${accrual?.toFixed(2)}(利息)=${(
          money + accrual
        ).toFixed(2)}(总额)`;
      }
    },
    initDate: (field: Field) => {
      const date = field.query("..[-1].date").value();
      if (!date) {
        return;
      }
      const [, end] = date;
      field.value = [end, end];
    },
    initMoney: (field: Field) => {
      const prevMoney = field
        .query("..[-1].total")
        .value()
        ?.replace(/\s/g, "")
        .match(/\d+(.\d+)?/g)
        .pop();
      if (!prevMoney) {
        return;
      }
      field.value = prevMoney;
    },
    initRate: (field: Field) => {
      const prevRate = field.query("..[-1].rate").value();
      const backMoney = field.query(".backMoney").value();
      if (prevRate === undefined) return;
      if (backMoney) {
        field.value = 0;
        field.setComponentProps({ disabled: true });
      } else if (prevRate) {
        field.value = field.query("..[-1].rate").value();
      } else {
        let i = 1;
        while (!field.query(`..[-${++i}].rate`).value()) {}
        field.value = field.query(`..[-${i}].rate`).value();
      }
    },
    initCharge: (field: Field) => {
      const total = field
        .query(".total")
        .value()
        ?.replace(/\s/g, "")
        .match(/\d+(.\d+)?/g)
        .pop();
      field.value = rule(+total);
    },
  },
});

const form = createForm();
const saveForm = createForm();
const schema = {
  type: "object",
  properties: {
    projects: {
      type: "array",
      "x-decorator": "FormItem",
      "x-component": "ArrayTable",
      items: {
        type: "object",
        properties: {
          column_1: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              width: 50,
              title: "拖拽排序",
              align: "center",
            },
            properties: {
              sortable: {
                type: "void",
                "x-component": "ArrayTable.SortHandle",
              },
            },
          },
          column_2: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              width: 50,
              title: "删除",
              align: "center",
            },
            properties: {
              remove: {
                type: "void",
                "x-component": "ArrayTable.Remove",
              },
            },
          },
          column_3: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              title: "时间",
              width: 400,
            },
            properties: {
              date: {
                type: "number",
                default: 0,
                "x-decorator": "FormItem",
                "x-component": "DatePicker.RangePicker",
                "x-component-props": {
                  allowClear: false,
                  style: { width: "100%" },
                },
                "x-reactions": "{{initDate}}",
              },
            },
          },
          column_4: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              title: "借贷的金额(元)(借钱)",
              width: 250,
            },
            properties: {
              money: {
                type: "number",
                default: 10000,
                "x-component": "NumberPicker",
                "x-reactions": "{{initMoney}}",
                "x-component-props": {
                  style: { width: "100%" },
                },
              },
            },
          },
          column_5: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              title: "归还的金额(元)(还钱)",
              width: 150,
            },
            properties: {
              backMoney: {
                type: "number",
                default: 0,
                "x-component": "NumberPicker",
                "x-component-props": {
                  style: { width: "100%" },
                },
              },
            },
          },
          column_6: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              title: "利率(%)",
              width: 100,
            },
            properties: {
              rate: {
                type: "number",
                default: 1,
                "x-component": "NumberPicker",
                "x-reactions": "{{initRate}}",
                "x-component-props": {
                  style: { width: "100%" },
                },
              },
            },
          },
          column_7: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              title: "周期",
              width: 180,
            },
            properties: {
              cyc: {
                type: "number",
                "x-component": "Select",
                default: 30,
                "x-component-props": {
                  style: { width: "100%" },
                },
                enum: [
                  { label: "日利率", value: 1 },
                  { label: "周利率", value: 7 },
                  { label: "月利率", value: 30 },
                  { label: "季利率", value: 120 },
                  { label: "年利率", value: 360 },
                ],
              },
            },
          },
          column_8: {
            type: "void",
            "x-component": "ArrayTable.Column",
            "x-component-props": {
              title: "本金+利息",
              width: 480,
            },
            properties: {
              total: {
                type: "string",
                "x-read-pretty": true,
                "x-decorator": "FormItem",
                "x-component": "NumberPicker",
                "x-component-props": {
                  addonAfter: "￥",
                },
                "x-reactions": "{{computeRate}}",
              },
            },
          },
        },
      },
      properties: {
        add: {
          type: "void",
          title: "添加计算栏",
          "x-component": "ArrayTable.Addition",
        },
      },
    },
  },
};
interface SaveObj {
  id: number;
  name?: string;
}

const App = () => {
  const [form1] = Form.useForm();
  const [count, setCount] = useState(0);
  const [store, setStore] = useLocalStorage("xiaokeai", []);
  const saveInLocalStorage = (obj: SaveObj, active: string) => {
    if (!window.localStorage) {
      notification.error({
        message: "保存失败！",
        description: "原因本地获取localStorage失败",
      });
      return;
    }
    if (active === "add") {
      setStore([obj, ...store]);
      notification.success({
        message: "保存成功！",
        description: "您可厉害了",
      });
    } else if (active === "remove") {
      setStore(store.filter(({ id }: SaveObj) => obj?.id !== id));
      notification.warn({
        message: "移除成功！",
        description: "牛牛牛",
      });
    }
  };
  const modal = {
    title: "小可爱，这里输入保存时的名字",
    content: (
      <FormProvider form={saveForm}>
        <SchemaField>
          <SchemaField.String
            name="name"
            x-decorator="FormItem"
            x-component="Input"
            required
          />
        </SchemaField>
      </FormProvider>
    ),
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      const saveFormValue: object = await saveForm.submit();
      const formValue: object = await form.submit();
      console.log({ ...formValue, id: Date.now(), ...saveFormValue });
      saveInLocalStorage(
        { ...formValue, id: Date.now(), ...saveFormValue },
        "add"
      );
      return Promise.resolve();
    },
  };
  const onFinish = (values: any) => {
    const { co } = values;
    if (co) {
      setCount(Number(rule(co)));
    }
  };
  return (
    <div>
      <h1 className="title">小可爱的复利计算器</h1>
      <ConfigProvider locale={locale}>
        <FormProvider form={form}>
          <SchemaField schema={schema} />
        </FormProvider>
        <Card>
          <Form form={form1} layout="inline" onFinish={onFinish}>
            <Form.Item name="co" label="计算金额">
              <InputNumber
                style={{ width: "200px" }}
                min={1}
                onChange={(value) => setCount(Number(rule(value)))}
              />
              元
            </Form.Item>
            <Form.Item label="律师费用">{count}元</Form.Item>
          </Form>
        </Card>
        <div className="save-wrap">
          <Button
            style={{ marginRight: "10px" }}
            type="primary"
            size="large"
            danger
            onClick={() => Modal.confirm(modal)}
          >
            保存
          </Button>
          <div className="save-list">
            {store.map((i: any) => {
              return (
                <Dropdown.Button
                  size="small"
                  type="primary"
                  overlay={
                    <Menu
                      onClick={(e) => {
                        saveInLocalStorage(i, e.key);
                      }}
                    >
                      <Menu.Item key="remove">移除</Menu.Item>
                    </Menu>
                  }
                  onClick={() => {
                    form.setValues(i);
                  }}
                >
                  {i.name}
                </Dropdown.Button>
              );
            })}
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
};

export default App;
