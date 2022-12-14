import React, { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'
import { Breadcrumb, DatePicker, Modal, Skeleton, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

import { CButton, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'

import issueApi from '~/api/issueApi'

import ErrorMsg from '~/components/Common/ErrorMsg'
import AdminHeader from '~/components/AdminDashboard/AdminHeader'
import AdminSidebar from '~/components/AdminDashboard/AdminSidebar'
import AdminFooter from '~/components/AdminDashboard/AdminFooter'
import { useSelector } from 'react-redux'
import moment from 'moment'

const IssueAdd = () => {
  const { currentClass } = useSelector((state) => state.profile)

  const [filter, setFilter] = useState({})
  const [detail, setDetail] = useState({
    title: '',
    milestone: {
      milestoneTitle: 'Select Milestone',
      group: [],
      requirement: [],
    },
    group: {
      groupName: 'Select Group',
    },
    assignee: 'Select Assignee',
    requirement: { id: null, title: 'General Requirement' },
    type: { title: 'Select Type' },
    status: {
      id: 1,
      title: 'Open',
    },
    deadline: null,
    description: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFilter({})
    setDetail({
      title: '',
      milestone: {
        milestoneTitle: 'Select Milestone',
        group: [],
        requirement: [],
      },
      group: {
        groupName: 'Select Group',
      },
      assignee: 'Select Assignee',
      requirement: { id: null, title: 'General Requirement' },
      type: { title: 'Select Type' },
      status: {
        id: 1,
        title: 'Open',
      },
      deadline: null,
      description: '',
    })
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClass])

  useEffect(() => {
    document.title = 'LMS - Issue Add'
    window.scrollTo(0, 0)
  }, [])

  const loadData = async () => {
    setLoading(true)
    await issueApi
      .getAddFilter(currentClass)
      .then((response) => {
        console.log(response)
        setFilter((prev) => ({
          ...prev,
          ...response,
          requirement: [{ id: null, title: 'General Requirement' }, ...response.requirement],
          statusFilter: [{ id: 1, title: 'Open' }, ...response.statusFilter],
        }))
      })
      .catch((error) => {
        setError('Something went wrong, please try again')
      })
      .finally(() => setLoading(false))
  }

  const handleSave = async () => {
    if (detail.title.trim() === '') {
      setError('Title must not empty')
      return
    }
    if (detail.milestone.milestoneTitle === 'Select Milestone') {
      setError('Milestone must not empty')
      return
    }

    if (detail.type.title === 'Select Type') {
      setError('Type must not empty')
      return
    }

    const params = {
      title: detail.title.trim(),
      milestoneId: detail.milestone.milestoneId,
      description: detail.description.trim(),
      statusId: detail.status.id,
    }
    if (detail.group.groupName !== 'This milestone working individually') {
      params.groupId = detail.group.groupId
    }
    if (detail.assignee !== 'Select Assignee') {
      params.asigneeName = detail.assignee
    }
    if (detail.assignee === 'Unassigned') {
      params.asigneeName = null
    }
    if (detail.type.title !== 'Select Type' || detail.type.title !== 'None') {
      params.typeId = detail.type.id
    }
    if (detail.requirement.id !== null) {
      params.requirementId = detail.requirement.id
    }
    if (detail.deadline !== null) {
      params.deadline = moment(detail.deadline).format('YYYY-MM-DD')
    }

    await issueApi
      .addIssue(currentClass, params)
      .then((response) => {
        setError('You have successfully add new issue')
      })
      .catch((error) => {
        if (error.response.data.message === 'Title already exist') {
          setError('Requirement Title already existed')
          return
        }
        setError('Something went wrong, please try again')
      })
  }

  const modalConfirm = () => {
    setError('')
    Modal.confirm({
      title: `Are you want to save new Issue?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'OK',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        handleSave()
      },
      onCancel() {},
    })
  }

  return (
    <div>
      <AdminSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AdminHeader />
        <div className="body flex-grow-1 px-3">
          <div className="col-lg-12 ">
            <div className="row">
              <div className="col-lg-12 m-b30">
                <div className="row">
                  <div className="col-12 d-flex align-items-center">
                    <Breadcrumb>
                      <Breadcrumb.Item>
                        <Link to="/dashboard">Dashboard</Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <Link to="/issue-list">Issue List</Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>Issue Add</Breadcrumb.Item>
                    </Breadcrumb>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 d-flex ">
            <div className="col-lg-12 m-b30">
              <div className="widget-box">
                <div className="widget-inner">
                  <Skeleton loading={loading}>
                    <div className="row">
                      <div className="form-group col-12">
                        <div>
                          <label className="col-form-label">
                            Title <Typography.Text type="danger">*</Typography.Text>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            value={detail.title}
                            onChange={(e) => setDetail((prev) => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <div>
                          <label className="col-form-label">
                            Milestone <Typography.Text type="danger">*</Typography.Text>
                          </label>

                          <CDropdown className="w-100">
                            <CDropdownToggle color="warning">{detail?.milestone?.milestoneTitle}</CDropdownToggle>
                            <CDropdownMenu className="w-100" style={{ maxHeight: '300px', overflow: 'auto' }}>
                              {filter?.milestoneFilter?.map((milestone) => (
                                <CDropdownItem
                                  onClick={() => {
                                    console.log(milestone)
                                    setDetail((prev) => ({
                                      ...prev,
                                      milestone: milestone,
                                      group: {
                                        ...prev.group,
                                        groupName: milestone.teamwork
                                          ? 'Select Group'
                                          : 'This milestone working individually',
                                      },
                                      assignee: 'Select Assignee',
                                      requirement: { id: null, title: 'General Requirement' },
                                    }))
                                  }}
                                >
                                  {milestone?.milestoneTitle}
                                </CDropdownItem>
                              ))}
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <div>
                          <label className="col-form-label">Group</label>
                          <CDropdown className="w-100">
                            <CDropdownToggle
                              color="warning"
                              disabled={
                                detail.milestone.milestoneTitle === 'Select Milestone' || !detail.milestone.teamwork
                              }
                            >
                              {detail?.group?.groupName}
                            </CDropdownToggle>
                            <CDropdownMenu className="w-100" style={{ maxHeight: '300px', overflow: 'auto' }}>
                              {detail?.milestone?.groups?.map((group) => (
                                <CDropdownItem
                                  onClick={() => {
                                    setDetail((prev) => ({ ...prev, group: group, assignee: 'Select Assignee' }))
                                  }}
                                >
                                  {group?.groupName}
                                </CDropdownItem>
                              ))}
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <div>
                          <label className="col-form-label">Assignee</label>

                          <CDropdown className="w-100">
                            <CDropdownToggle
                              color="warning"
                              disabled={
                                detail.milestone.milestoneTitle === 'Select Milestone' ||
                                detail.group.groupName === 'Select Group'
                              }
                            >
                              {detail?.assignee}
                            </CDropdownToggle>
                            <CDropdownMenu className="w-100" style={{ maxHeight: '300px', overflow: 'auto' }}>
                              {detail.milestone.teamwork === true && (
                                <>
                                  <CDropdownItem
                                    onClick={() => setDetail((prev) => ({ ...prev, assignee: 'Unassigned' }))}
                                  >
                                    Unassigned
                                  </CDropdownItem>
                                  {detail.group?.memberId?.map((member) => (
                                    <CDropdownItem onClick={() => setDetail((prev) => ({ ...prev, assignee: member }))}>
                                      {member}
                                    </CDropdownItem>
                                  ))}
                                </>
                              )}

                              {detail.milestone.teamwork === false && (
                                <>
                                  <CDropdownItem
                                    onClick={() => setDetail((prev) => ({ ...prev, assignee: 'Unassigned' }))}
                                  >
                                    Unassigned
                                  </CDropdownItem>
                                  {filter?.traineesToAsign?.map((member) => (
                                    <CDropdownItem onClick={() => setDetail((prev) => ({ ...prev, assignee: member }))}>
                                      {member}
                                    </CDropdownItem>
                                  ))}
                                </>
                              )}
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <div>
                          <label className="col-form-label">
                            Type <Typography.Text type="danger">*</Typography.Text>
                          </label>

                          <CDropdown className="w-100">
                            <CDropdownToggle color="warning">{detail?.type?.title}</CDropdownToggle>
                            <CDropdownMenu className="w-100" style={{ maxHeight: '300px', overflow: 'auto' }}>
                              {filter?.typeFilter?.map((type) => (
                                <CDropdownItem onClick={() => setDetail((prev) => ({ ...prev, type: type }))}>
                                  {type?.title}
                                </CDropdownItem>
                              ))}
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <div>
                          <label className="col-form-label">Requirement</label>

                          <CDropdown className="w-100">
                            <CDropdownToggle color="warning" disabled={detail.type.title === 'Select Type'}>
                              {detail?.requirement?.title}
                            </CDropdownToggle>
                            <CDropdownMenu className="w-100" style={{ maxHeight: '300px', overflow: 'auto' }}>
                              {detail?.milestone?.requirements?.map((requirement) => (
                                <CDropdownItem
                                  onClick={() => setDetail((prev) => ({ ...prev, requirement: requirement }))}
                                >
                                  {requirement?.title}
                                </CDropdownItem>
                              ))}
                            </CDropdownMenu>
                          </CDropdown>
                        </div>
                      </div>
                      <div className="form-group col-4">
                        <div>
                          <label className="col-form-label">Deadline</label>
                          <DatePicker
                            className="w-100"
                            size={'large'}
                            format={'YYYY-MM-DD'}
                            value={detail.deadline}
                            disabled={detail.type.title === 'Select Type'}
                            disabledDate={(current) => {
                              let customDate = moment().format('YYYY-MM-DD')
                              return current && current < moment(customDate, 'YYYY-MM-DD')
                            }}
                            onChange={(date) => setDetail((prev) => ({ ...prev, deadline: date }))}
                          />
                        </div>
                      </div>
                      <div className="form-group col-12">
                        <label className="col-form-label">Description</label>
                        <div>
                          <textarea
                            name="message"
                            rows="4"
                            className="form-control"
                            required
                            value={detail.description}
                            onChange={(e) => setDetail((prev) => ({ ...prev, description: e.target.value }))}
                          ></textarea>
                        </div>
                      </div>
                      <ErrorMsg
                        errorMsg={error}
                        isError={error === 'You have successfully add new issue' ? false : true}
                      />
                      <div className="d-flex">
                        <CButton size="md" className="mr-3" color="warning" onClick={modalConfirm}>
                          Add
                        </CButton>
                      </div>
                    </div>
                  </Skeleton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default IssueAdd
