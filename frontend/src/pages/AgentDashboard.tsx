import { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Button, Tag, Space, Typography } from 'antd';
import { DashboardOutlined, InboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { dashboardService } from '../services/dashboardService';
import { taskService } from '../services/taskService';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
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
      setMyTasks(tasksRes.filter((t: any) => t.assignedTo === user?.id));
      
      // Get available tasks (pending and unassigned)
      const allTasks = await taskService.getAll({ status: 'pending' });
      setAvailableTasks(allTasks.tasks.filter((t: any) => !t.assignedTo));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleClaimTask = async (taskId: number) => {
    setLoading(true);
    try {
      await taskService.claim(taskId);
      message.success('Task claimed successfully!');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to claim task');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (taskId: number) => {
    setLoading(true);
    try {
      await taskService.submitForReview(taskId);
      message.success('Task submitted for review!');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    setLoading(true);
    try {
      const result = await taskService.complete(taskId);
      message.success('Task completed! Next task auto-created.');
      if (result.nextTask) {
        message.info(`Next task created: ${result.nextTask.title}`);
      }
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const myTasksColumns = [
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'in_progress' && record.taskType !== 'qa' && (
            <Button size="small" onClick={() => handleCompleteTask(record.id)}>
              Complete & Next
            </Button>
          )}
          {record.status === 'in_progress' && record.taskType === 'qa' && (
            <Button size="small" onClick={() => handleSubmitForReview(record.id)}>
              Submit for Review
            </Button>
          )}
          <Button size="small" onClick={() => navigate(`/tasks/${record.id}`)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  const availableTasksColumns = [
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleClaimTask(record.id)}
          loading={loading}
        >
          Claim Task
        </Button>
      ),
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
          <Menu.Item key="my-tasks" icon={<CheckCircleOutlined />}>My Tasks</Menu.Item>
          <Menu.Item key="available" icon={<InboxOutlined />}>Available Tasks</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Welcome, {user?.displayName || user?.username} ({user?.role})</span>
          <Button onClick={handleLogout}>Logout</Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Title level={2}>{user?.role === 'developer' ? 'Developer' : user?.role === 'designer' ? 'Designer' : 'QA'} Dashboard</Title>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="My Tasks" value={myTasks.length} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Available" value={availableTasks.length} />
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

          <Card title="My Tasks" style={{ marginBottom: 24 }}>
            <Table columns={myTasksColumns} dataSource={myTasks} rowKey="id" pagination={false} />
          </Card>

          <Card title="Available Tasks">
            <Table columns={availableTasksColumns} dataSource={availableTasks} rowKey="id" pagination={false} />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
