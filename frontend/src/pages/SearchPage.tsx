import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Form, Input, Select, DatePicker, Button, Table, Tag, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { taskService } from '../services/taskService';
import { useAuthStore } from '../store/authStore';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

export default function SearchPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [form] = Form.useForm();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleSearch = async (values: any) => {
    setLoading(true);
    try {
      const params: any = {
        ...values,
        page,
        pageSize,
      };

      if (values.dateRange && Array.isArray(values.dateRange)) {
        params.dateFrom = values.dateRange[0].toISOString();
        params.dateTo = values.dateRange[1].toISOString();
      }

      const response = await taskService.search(params);
      setResults(response.tasks);
      setTotal(response.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setResults([]);
    setTotal(0);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/tasks/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type: string) => (
        <Tag color={type === 'design' ? 'blue' : type === 'development' ? 'green' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={priority === 'urgent' ? 'red' : priority === 'high' ? 'orange' : 'default'}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: any = {
          pending: 'default',
          in_progress: 'processing',
          review: 'warning',
          completed: 'success',
        };
        return <Tag color={colorMap[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Assignee',
      dataIndex: ['assignee', 'displayName'],
      key: 'assignee',
      render: (text: string) => text || 'Unassigned',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => navigate('/dashboard')} style={{ marginRight: 16 }}>
          Back
        </Button>
        <span style={{ fontWeight: 'bold', fontSize: 18 }}>Advanced Search</span>
      </Header>
      <Content style={{ margin: 24 }}>
        <Card title="Search Filters" style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical" onFinish={handleSearch}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="keyword" label="Keyword">
                  <Input placeholder="Search title or description" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="status" label="Status">
                  <Select allowClear placeholder="Select status">
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="in_progress">In Progress</Select.Option>
                    <Select.Option value="review">Review</Select.Option>
                    <Select.Option value="completed">Completed</Select.Option>
                    <Select.Option value="cancelled">Cancelled</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="taskType" label="Type">
                  <Select allowClear placeholder="Select type">
                    <Select.Option value="design">Design</Select.Option>
                    <Select.Option value="development">Development</Select.Option>
                    <Select.Option value="qa">QA</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="priority" label="Priority">
                  <Select allowClear placeholder="Select priority">
                    <Select.Option value="low">Low</Select.Option>
                    <Select.Option value="medium">Medium</Select.Option>
                    <Select.Option value="high">High</Select.Option>
                    <Select.Option value="urgent">Urgent</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="dateRange" label="Date Range">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Search
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card
          title={`Search Results ${total > 0 ? `(${total} tasks found)` : ''}`}
        >
          <Table
            columns={columns}
            dataSource={results}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (newPage, newPageSize) => {
                setPage(newPage);
                setPageSize(newPageSize);
                if (form.getFieldsValue().keyword || form.getFieldsValue().status) {
                  handleSearch(form.getFieldsValue());
                }
              },
            }}
          />
        </Card>
      </Content>
    </Layout>
  );
}
