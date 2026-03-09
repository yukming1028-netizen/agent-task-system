import React, { useEffect, useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd';
import {
  DashboardOutlined,
  PlusOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../services/dashboard.service';
import { taskService } from '../services/task.service';
import { authService } from '../services/auth.service';
import type { Task, DashboardStats, AgentStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, inProgress: 0, completed: 0, review: 0 });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summary, agentsData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getAgents(),
      ]);
      setStats(summary.stats);
      setTasks(summary.recentTasks);
      setAgents(agentsData);
    } catch (error: any) {
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (values: any) => {
    try {
      await taskService.create({
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      });
      message.success('Task created successfully!');
      setCreateModalVisible(false);
      form.resetFields();
      loadDashboardData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      review: 'warning',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'default',
      medium: 'processing',
      high: 'warning',
      urgent: 'error',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={
          status === 'completed' ? <CheckCircleOutlined /> :
          status === 'in_progress' ? <SyncOutlined spin /> :
          <ClockCircleOutlined />
        }>
          {status.toUpperCase()}
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
      title: 'Action',
      key: 'action',
      render: (_: any, record: Task) => (
        <Button type="link" onClick={() => navigate(`/tasks/${record.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ padding: 16, fontSize: 18, fontWeight: 'bold' }}>
          Agent Task
        </div>
        <Menu mode="inline" selectedKeys={['dashboard']}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontSize: 16 }}>Welcome, {user?.displayName || user?.username}</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Header>
        <Content style={{ padding: 24 }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Tasks" value={stats.total} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#999' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="In Progress" value={stats.inProgress} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Completed" value={stats.completed} valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
          </Row>

          <Card
            title="Recent Tasks"
            extra={
              user?.role === 'manager' && (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                  Create Task
                </Button>
              )
            }
          >
            <Table
              columns={columns}
              dataSource={tasks}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>

          <Card title="Agent Status" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              {agents.map((agent) => (
                <Col span={6} key={agent.id}>
                  <Card size="small">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: agent.status === 'available' ? '#52c41a' : '#faad14',
                      }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{agent.displayName || agent.username}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>
                          {agent.role} • {agent.currentTasks} tasks
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Content>
      </Layout>

      <Modal
        title="Create New Task"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTask}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Task title" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Task description" />
          </Form.Item>
          <Form.Item name="taskType" label="Task Type" rules={[{ required: true }]}>
            <Select placeholder="Select type">
              <Option value="design">Design</Option>
              <Option value="development">Development</Option>
              <Option value="qa">QA</Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="Priority" initialValue="medium">
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>
          <Form.Item name="assignedTo" label="Assign To">
            <Select placeholder="Select agent" allowClear>
              {agents.filter(a => a.role !== 'manager').map((agent) => (
                <Option key={agent.id} value={agent.id}>
                  {agent.displayName || agent.username} ({agent.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
