import { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, Select, DatePicker, Tag, Space } from 'antd';
import { PlusOutlined, DashboardOutlined, TeamOutlined, TaskOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { dashboardService } from '../services/dashboardService';
import { taskService } from '../services/taskService';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, tasksRes, agentsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getTasks({ limit: 10 }),
        dashboardService.getAgents(),
      ]);
      setSummary(summaryRes);
      setTasks(tasksRes);
      setAgents(agentsRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateTask = async (values: any) => {
    setLoading(true);
    try {
      await taskService.create({
        ...values,
        dueDate: values.dueDate?.toISOString(),
      });
      message.success('Task created successfully!');
      setIsModalOpen(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      title: 'Assignee',
      dataIndex: ['assignee', 'displayName'],
      key: 'assignee',
      render: (text: string) => text || 'Unassigned',
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
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div style={{ padding: 16, fontWeight: 'bold', fontSize: 18 }}>
          Agent Task System
        </div>
        <Menu mode="inline" defaultSelectedKeys={['dashboard']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="tasks" icon={<TaskOutlined />}>Tasks</Menu.Item>
          <Menu.Item key="agents" icon={<TeamOutlined />}>Agents</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Welcome, {user?.displayName || user?.username}</span>
          <Button onClick={handleLogout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
            <h1>Manager Dashboard</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
              Create New Task
            </Button>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Tasks" value={summary?.taskStats.total || 0} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Pending" value={summary?.taskStats.pending || 0} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="In Progress" value={summary?.taskStats.inProgress || 0} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Completed" value={summary?.taskStats.completed || 0} />
              </Card>
            </Col>
          </Row>

          <Card title="Recent Tasks" style={{ marginBottom: 24 }}>
            <Table columns={columns} dataSource={tasks} rowKey="id" pagination={false} />
          </Card>

          <Card title="Agent Status">
            <Row gutter={16}>
              {agents.map((agent) => (
                <Col span={6} key={agent.userId}>
                  <Card size="small">
                    <strong>{agent.displayName}</strong>
                    <br />
                    <Tag color={agent.status === 'available' ? 'green' : 'red'}>
                      {agent.status.toUpperCase()}
                    </Tag>
                    <br />
                    <small>{agent.currentTasks}/{agent.maxTasks} tasks</small>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Content>
      </Layout>

      <Modal
        title="Create New Task"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item name="title" label="Task Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="taskType" label="Task Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="design">Design</Select.Option>
              <Select.Option value="development">Development</Select.Option>
              <Select.Option value="qa">QA</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue="medium">
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="assignedTo" label="Assign To">
            <Select allowClear>
              {agents.map((agent) => (
                <Select.Option key={agent.userId} value={agent.userId}>
                  {agent.displayName} ({agent.role})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
