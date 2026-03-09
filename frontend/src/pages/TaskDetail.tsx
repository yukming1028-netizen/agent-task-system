import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Row, Col, Tag, Button, Descriptions, Timeline, Typography, Space, Divider, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { taskService } from '../services/taskService';
import { useAuthStore } from '../store/authStore';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      const data = await taskService.getOne(Number(id));
      setTask(data);
    } catch (error) {
      message.error('Failed to load task details');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    try {
      await taskService.updateStatus(Number(id), status);
      message.success('Status updated successfully!');
      loadTask();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setLoading(true);
    try {
      await taskService.submitForReview(Number(id));
      message.success('Task submitted for review!');
      loadTask();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  const statusColorMap: any = {
    pending: 'default',
    in_progress: 'processing',
    review: 'warning',
    completed: 'success',
    cancelled: 'default',
  };

  const priorityColorMap: any = {
    low: 'default',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ marginRight: 16 }}>
          Back
        </Button>
        <Title level={4} style={{ margin: 0 }}>Task Details</Title>
      </Header>
      <Content style={{ margin: 24 }}>
        <Card>
          <Row gutter={16}>
            <Col span={16}>
              <Title level={2}>{task.title}</Title>
              <Space style={{ marginBottom: 16 }}>
                <Tag color={statusColorMap[task.status]}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </Tag>
                <Tag color={priorityColorMap[task.priority]}>
                  {task.priority.toUpperCase()}
                </Tag>
                <Tag>
                  {task.taskType.toUpperCase()}
                </Tag>
              </Space>
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Space>
                {task.status === 'in_progress' && user?.id === task.assignedTo && (
                  <Button type="primary" onClick={handleSubmitForReview} loading={loading}>
                    Submit for Review
                  </Button>
                )}
                {task.status === 'pending' && !task.assignedTo && (
                  <Button type="primary" onClick={() => taskService.claim(Number(id)).then(() => {
                    message.success('Task claimed!');
                    loadTask();
                  })} loading={loading}>
                    Claim Task
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          <Divider />

          <Descriptions column={2} bordered>
            <Descriptions.Item label="Created By">
              {task.creator?.displayName || task.creator?.username}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">
              {task.assignee?.displayName || task.assignee?.username || 'Unassigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(task.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(task.updatedAt).toLocaleString()}
            </Descriptions.Item>
            {task.completedAt && (
              <Descriptions.Item label="Completed At">
                {new Date(task.completedAt).toLocaleString()}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          <Title level={4}>Description</Title>
          <Text>{task.description || 'No description provided.'}</Text>

          {task.taskHistories && task.taskHistories.length > 0 && (
            <>
              <Divider />
              <Title level={4}>Activity Timeline</Title>
              <Timeline>
                {task.taskHistories.map((history: any) => (
                  <Timeline.Item key={history.id}>
                    <Text strong>{history.action.replace('_', ' ')}</Text>
                    <br />
                    <Text type="secondary">
                      {new Date(history.createdAt).toLocaleString()} by {history.user?.displayName || history.user?.username}
                    </Text>
                    {history.comment && <br />}
                    {history.comment && <Text>{history.comment}</Text>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
}
